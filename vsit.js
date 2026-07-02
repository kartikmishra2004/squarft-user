import sql from "../config/db.js";
import { validate as isUUID } from "uuid";
import { getIO } from "../config/socket.js";
import { sendNotification } from "../utils/sendNotification.js";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const VALID_VISIT_STATUSES = new Set([
  "pending",
  "pending_confirmation",
  "confirmed",
  "completed",
  "cancelled",
  "rescheduled",
]);
// ✅ FIX 1: Add missing constant
const VALID_TRANSITIONS = {
  pending: ["confirmed", "cancelled", "rescheduled"],
  pending_confirmation: ["confirmed", "cancelled", "rescheduled"],
  confirmed: ["completed", "cancelled", "rescheduled"],
  completed: [],
  cancelled: [],
  rescheduled: ["confirmed", "cancelled"]
};
const STAFF_VISIT_ROLES = new Set(["admin", "super_admin", "sales_officer", "service"]);

const parseStatusFilter = (status) => {
  const raw = Array.isArray(status) ? status.join(",") : status;
  return String(raw || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => VALID_VISIT_STATUSES.has(item));
};

const parseDateOnly = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcMidnight = new Date(Date.UTC(year, month - 1, day));
  if (
    utcMidnight.getUTCFullYear() !== year ||
    utcMidnight.getUTCMonth() !== month - 1 ||
    utcMidnight.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day, dateStr: value };
};

const getKolkataParts = (date) => {
  const kolkataDate = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    dayOfWeek: kolkataDate.getUTCDay(),
    hours: kolkataDate.getUTCHours(),
    minutes: kolkataDate.getUTCMinutes(),
  };
};

const toTimeString = ({ hours, minutes }) =>
  `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

const getKolkataDateRange = ({ year, month, day }) => ({
  dayStart: new Date(Date.UTC(year, month - 1, day) - IST_OFFSET_MS).toISOString(),
  dayEnd: new Date(Date.UTC(year, month - 1, day + 1) - IST_OFFSET_MS - 1).toISOString(),
});

const createKolkataSlotDate = ({ year, month, day }, hours, minutes) =>
  new Date(Date.UTC(year, month - 1, day, hours, minutes) - IST_OFFSET_MS);

const hasBranchColumn = async (columnName) => {
  const [column] = await sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'branches'
      AND column_name = ${columnName}
    LIMIT 1
  `;
  return Boolean(column);
};

export const getVisitList = async (req, res) => {
    const { status } = req.query
    const userId = req.user?.id

    if (!status) {
        return res.status(400).json({ message: 'Status is required', success: false })
    }

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized', success: false })
    }

    const statuses = parseStatusFilter(status)
    if (statuses.length === 0) {
        return res.status(400).json({ message: 'Invalid status filter', success: false })
    }

    try {
       const visits = await sql`
    SELECT 
        v.*,
        u.first_name        AS user_first_name,
        u.last_name         AS user_last_name,
        u.phone             AS user_phone,
        p.title             AS property_title,
        p.area              AS property_address,
        p.project_id        AS project_id,
        o.first_name        AS officer_first_name,
        o.last_name         AS officer_last_name
    FROM visits v
    LEFT JOIN users u           ON v.user_id     = u.id
    LEFT JOIN properties p      ON v.property_id = p.id
    LEFT JOIN users o           ON v.officer_id  = o.id
    WHERE v.user_id = ${userId}
      AND v.status = ANY(${statuses}::text[])
    ORDER BY v.slot_start DESC
        `
        res.json({ success: true, data: visits })
    } catch (error) {
        console.error("Visit list Error:", error);
        res.status(500).json({ success: false, message: "Failed to list visits" });
    }
}

export const getBranchList = async (req, res) => {
    const { city } = req.query

    if (!city) {
        return res.status(400).json({ message: 'City is required', success: false })
    }

    try {
        const hasStatus = await hasBranchColumn("status")
        const branches = hasStatus ? await sql`
            SELECT 
                b.*,
                COUNT(DISTINCT bm.user_id)  AS manager_count,
                COUNT(DISTINCT bo.user_id)  AS officer_count
            FROM branches b
            LEFT JOIN branch_managers       bm ON b.id = bm.branch_id
            LEFT JOIN branch_sales_officers bo ON b.id = bo.branch_id
            WHERE LOWER(b.city) = LOWER(${city})
              AND UPPER(COALESCE(b.status, 'ACTIVE')) = 'ACTIVE'
            GROUP BY b.id
            ORDER BY b.name ASC
        ` : await sql`
            SELECT 
                b.*,
                COUNT(DISTINCT bm.user_id)  AS manager_count,
                COUNT(DISTINCT bo.user_id)  AS officer_count
            FROM branches b
            LEFT JOIN branch_managers       bm ON b.id = bm.branch_id
            LEFT JOIN branch_sales_officers bo ON b.id = bo.branch_id
            WHERE LOWER(b.city) = LOWER(${city})
              AND b.is_active = true
            GROUP BY b.id
            ORDER BY b.name ASC
        `
        res.json({ success: true, data: branches })
    } catch (error) {
        console.error("Branch list Error:", error);
        res.status(500).json({ success: false, message: "Failed to list branches" });
    }
}

export const getAvailableSlots = async (req, res) => {
    const { property_id, date, branch_id } = req.query

    // ✅ FIX 2: Validate branch_id also
    if (!property_id || !date || !branch_id) {
        return res.status(400).json({
            success: false,
            message: 'property_id, date and branch_id are required'
        })
    }

    if (!isUUID(property_id) || !isUUID(branch_id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid property_id or branch_id'
        })
    }

    const targetDate = parseDateOnly(date)

    // ✅ FIX 3: correct date validation
    if (!targetDate) {
        return res.status(400).json({ success: false, message: 'Invalid date format' })
    }

    const dayOfWeek = new Date(Date.UTC(targetDate.year, targetDate.month - 1, targetDate.day)).getUTCDay()

    try {
        const [property] = await sql`SELECT id FROM properties WHERE id = ${property_id}`
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' })
        }

        const schedules = await sql`
            SELECT
                os.officer_id,
                os.work_start,
                os.work_end,
                os.slot_duration,
                u.first_name,
                u.last_name
            FROM officer_schedules os
            JOIN users u ON u.id = os.officer_id
            WHERE os.branch_id   = ${branch_id}
              AND os.day_of_week = ${dayOfWeek}
              AND os.is_active   = true
        `

        if (schedules.length === 0) {
            return res.json({ success: true, data: [] })
        }

        const officerIds = schedules.map(s => s.officer_id)
        const { dayStart, dayEnd } = getKolkataDateRange(targetDate)

        const [bookedVisits, unavailableOfficers] = await Promise.all([
          sql`
            SELECT officer_id, slot_start
            FROM visits
            WHERE officer_id = ANY(${officerIds}::uuid[])
              AND slot_start >= ${dayStart}
              AND slot_start <= ${dayEnd}
              AND status NOT IN ('cancelled', 'rescheduled')
          `,
          sql`
            SELECT officer_id
            FROM officer_unavailability
            WHERE officer_id = ANY(${officerIds}::uuid[])
              AND ${date}::date BETWEEN date_start AND date_end
          `
        ])

        const bookedSet = new Set(
            bookedVisits.map(v => `${v.officer_id}|${v.slot_start.toISOString()}`)
        )
        const unavailableOfficerIds = new Set(unavailableOfficers.map(r => r.officer_id))

        const freeByTime = new Map()

        for (const schedule of schedules) {
            const { officer_id, work_start, work_end, slot_duration } = schedule
            if (unavailableOfficerIds.has(officer_id)) continue

            const [startH, startM] = work_start.split(':').map(Number)
            const [endH, endM] = work_end.split(':').map(Number)
            const startMinutes = startH * 60 + startM
            const endMinutes = endH * 60 + endM

            for (let t = startMinutes; t + slot_duration <= endMinutes; t += slot_duration) {
                const slotHour = Math.floor(t / 60)
                const slotMinute = t % 60

                const slotStart = createKolkataSlotDate(targetDate, slotHour, slotMinute)
                const slotStartISO = slotStart.toISOString()

                const key = `${officer_id}|${slotStartISO}`
                if (!bookedSet.has(key)) {
                    const count = freeByTime.get(slotStartISO) ?? 0
                    freeByTime.set(slotStartISO, count + 1)
                }
            }
        }

        const slotDuration = schedules[0].slot_duration

        const slots = Array.from(freeByTime.entries())
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([slotStart, freeOfficerCount]) => {
                const start = new Date(slotStart)
                const end = new Date(start.getTime() + slotDuration * 60 * 1000)
                return {
                    slot_start: start.toISOString(),
                    slot_end: end.toISOString(),
                    available_officers: freeOfficerCount,
                }
            })

        return res.json({ success: true, data: slots })
    } catch (error) {
        console.error('getAvailableSlots Error:', error)
        res.status(500).json({ success: false, message: 'Failed to fetch available slots' })
    }
}

export const createSiteVisit = async (req, res) => {
    const { property_id, slot_start, user_note, branch_id: req_branch_id } = req.body

    // ✅ FIX 4: prevent crash
    const user_id = req.user?.id

    if (!user_id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    if (!property_id || !slot_start) {
        return res.status(400).json({
            success: false,
            message: 'property_id and slot_start are required'
        })
    }

    // ✅ FIX 5: UUID validation
    if (!isUUID(property_id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid property_id"
        })
    }

    if (req_branch_id && !isUUID(req_branch_id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid branch_id"
        })
    }

    const slotStartDate = new Date(slot_start)
    if (Number.isNaN(slotStartDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Invalid slot_start"
        })
    }

    try {
        const visit = await sql.begin(async (sql) => {
            const [property] = await sql`
                SELECT city FROM properties WHERE id = ${property_id}
            `
            if (!property) throw { status: 404, message: 'Property not found' }

            let branch_id = req_branch_id;
            if (!branch_id) {
                const hasStatus = await hasBranchColumn("status");
                const [branch] = hasStatus
                    ? await sql`SELECT id FROM branches WHERE LOWER(city) = LOWER(${property.city}) AND UPPER(COALESCE(status, 'ACTIVE')) = 'ACTIVE' LIMIT 1`
                    : await sql`SELECT id FROM branches WHERE LOWER(city) = LOWER(${property.city}) AND is_active = true LIMIT 1`;
                if (!branch) throw { status: 404, message: 'No active branch found in property city' };
                branch_id = branch.id;
            }

            const kolkataSlot = getKolkataParts(slotStartDate)
            const dayOfWeek = kolkataSlot.dayOfWeek
            const localSlotTime = toTimeString(kolkataSlot)

            const schedules = await sql`
                SELECT os.officer_id, os.slot_duration
                FROM officer_schedules os
                WHERE os.branch_id   = ${branch_id}
                  AND os.day_of_week = ${dayOfWeek}
                  AND os.is_active   = true
                  AND (
                      ${localSlotTime}::time >= os.work_start AND
                      ${localSlotTime}::time <  os.work_end
                  )
                ORDER BY os.officer_id
            `

            if (schedules.length === 0) {
                throw {
                    status: 409,
                    message: 'No sales officer is available for your selected slot. Please reschedule your site visit.',
                    notifyCustomerForReschedule: true
                }
            }

            const slotDuration = schedules[0].slot_duration
            const slotEnd = new Date(slotStartDate.getTime() + slotDuration * 60 * 1000)

            const [userConflict] = await sql`
                SELECT id FROM visits
                WHERE user_id    = ${user_id}
                  AND slot_start = ${slotStartDate.toISOString()}
                  AND status NOT IN ('cancelled', 'rescheduled')
            `
            if (userConflict) {
                throw { status: 409, message: 'You already have a booking at this time' }
            }

            const bookedAtSlot = await sql`
                SELECT officer_id FROM visits
                WHERE officer_id = ANY(${schedules.map(s => s.officer_id)}::uuid[])
                  AND slot_start = ${slotStartDate.toISOString()}
                  AND status NOT IN ('cancelled', 'rescheduled')
                FOR UPDATE
            `

            const bookedOfficerIds = new Set(bookedAtSlot.map(r => r.officer_id))

            const unavailableOfficers = await sql`
                SELECT officer_id
                FROM officer_unavailability
                WHERE officer_id = ANY(${schedules.map(s => s.officer_id)}::uuid[])
                  AND (${slotStartDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata')::date
                    BETWEEN date_start AND date_end
            `

            const unavailableOfficerIds = new Set(
                unavailableOfficers.map(r => r.officer_id)
            )

            const freeOfficers = schedules
                .map(s => s.officer_id)
                .filter(id => !bookedOfficerIds.has(id) && !unavailableOfficerIds.has(id))

            if (freeOfficers.length === 0) {
                throw {
                    status: 409,
                    message: 'No sales officer is available for your selected slot. Please reschedule your site visit.',
                    notifyCustomerForReschedule: true
                }
            }

            const [assigned] = await sql`
                SELECT u.id
                FROM users u
                WHERE u.id = ANY(${freeOfficers}::uuid[])
                ORDER BY (
                    SELECT COUNT(*) FROM visits v
                    WHERE v.officer_id = u.id
                      AND v.status NOT IN ('cancelled', 'rescheduled')
                ) ASC,
                u.id ASC
                LIMIT 1
            `

            const [newVisit] = await sql`
                INSERT INTO visits (
                    user_id, property_id, officer_id,
                    slot_start, slot_end, user_note
                )
                VALUES (
                    ${user_id},
                    ${property_id},
                    ${assigned.id},
                    ${slotStartDate.toISOString()},
                    ${slotEnd.toISOString()},
                    ${user_note || null}
                )
                RETURNING *
            `

            //Additional step to remove project from saved items when a visit is booked for a property under that project
            // Get corresponding project_id
            const [propertyProject] = await sql`
                SELECT project_id
                FROM properties
                WHERE id = ${property_id}
            `;

            const projectId = propertyProject?.project_id;

            // Remove project from saved items
            if (projectId) {
                await sql`
                    DELETE FROM saved_items
                    WHERE user_id = ${user_id}
                    AND item_id = ${projectId}
                    AND item_type = 'project'
                `;
            }

            return {
                ...newVisit,
                assigned_officer_id: assigned.id
            }
        })
        getIO().to(`officer_${visit.assigned_officer_id}`).emit('dashboard_update', {
            success: true,
            action: 'NEW_VISIT_BOOKED',
            data: visit
        });
        return res.status(201).json({ success: true, data: visit })
    } catch (error) {
        if (error.notifyCustomerForReschedule && user_id) {
            try {
                await sendNotification({
                    userId: user_id,
                    type: "visit_cancelled",
                    title: "Please reschedule your site visit",
                    body: "No sales officer is available for your selected slot. Please reschedule your site visit.",
                    metadata: {
                        property_id,
                        slot_start,
                    },
                });
            } catch (notificationError) {
                console.error("No-officer notification failed:", notificationError);
            }
        }

        if (error.status) {
            return res.status(error.status).json({ success: false, message: error.message })
        }
        console.error('createSiteVisit Error:', error)
        res.status(500).json({ success: false, message: 'Failed to create site visit' })
    }
}

const VALID_LEAD_TEMPERATURES = new Set(['hot', 'warm', 'cold', 'suspended']);

export const updateSiteVisit = async (req, res) => {
    const { id } = req.params;
    const { status, officer_note, cancellation_reason, lead_temperature } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: 'Visit id is required' });
    }

    if (!isUUID(id)) {
        return res.status(400).json({ success: false, message: 'Invalid visit id' });
    }

    if (lead_temperature && !VALID_LEAD_TEMPERATURES.has(lead_temperature)) {
        return res.status(400).json({
            success: false,
            message: `Invalid lead_temperature. Allowed: ${[...VALID_LEAD_TEMPERATURES].join(', ')}`
        });
    }

    try {
        const updated = await sql.begin(async (sql) => {
            const [visit] = await sql`
                SELECT * FROM visits WHERE id = ${id} FOR UPDATE
            `;
            if (!visit) throw { status: 404, message: 'Visit not found' };
            if (!STAFF_VISIT_ROLES.has(req.user?.role) && visit.user_id !== req.user?.id) {
                throw { status: 403, message: 'You are not allowed to update this visit' };
            }
            if (status && !VALID_TRANSITIONS[visit.status]?.includes(status)) {
                throw {
                    status: 422,
                    message: `Cannot transition from '${visit.status}' to '${status}'`
                };
            }

            const now = new Date().toISOString();
            const [updatedVisit] = await sql`
                UPDATE visits SET
                    status              = COALESCE(${status || null}, status),
                    officer_note        = COALESCE(${officer_note || null}, officer_note),
                    cancellation_reason = COALESCE(${cancellation_reason || null}, cancellation_reason),
                    lead_temperature    = COALESCE(${lead_temperature || null}, lead_temperature),
                    confirmed_at        = ${status === 'confirmed' ? now : visit.confirmed_at},
                    cancelled_at        = ${status === 'cancelled' ? now : visit.cancelled_at},
                    completed_at        = ${status === 'completed' ? now : visit.completed_at},
                    updated_at          = now()
                WHERE id = ${id}
                RETURNING *
            `;
            return updatedVisit;
        });
        getIO().to(`officer_${updated.officer_id}`).emit('dashboard_update', {
            success: true,
            action: 'VISIT_STATUS_CHANGED',
            data: updated
        });

        return res.json({ success: true, data: updated });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
        console.error('updateSiteVisit Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update site visit' });
    }
}
