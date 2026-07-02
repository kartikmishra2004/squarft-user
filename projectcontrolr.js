import sql from "../config/db.js";
import {
  uploadToSupabase,
  deleteFromSupabase,
} from "../utils/uploadToSupabase.js";
import { validate as isUUID } from "uuid";

const formatCurrency = (value) =>
  value === null || value === undefined
    ? null
    : `\u20B9${Number(value).toLocaleString("en-IN")}`;

const stripTrailingZeros = (value) => {
  const fixed = Number(value).toFixed(2);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

const formatCompactCurrency = (value) => {
  if (value === null || value === undefined) return null;

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return null;

  if (numberValue >= 10000000) {
    return `\u20B9${stripTrailingZeros(numberValue / 10000000)} Cr`;
  }

  if (numberValue >= 100000) {
    return `\u20B9${stripTrailingZeros(numberValue / 100000)} Lakh`;
  }

  return formatCurrency(numberValue);
};

const buildPriceRangeDisplay = (minPrice, maxPrice, formatter) => {
  const minDisplay = formatter(minPrice);
  const maxDisplay = formatter(maxPrice);

  if (!minDisplay || !maxDisplay) return null;
  if (Number(minPrice) === Number(maxPrice)) return minDisplay;

  return `${minDisplay} to ${maxDisplay}`;
};

export const listProjects = async (req, res) => {
  const response = await sql`
    SELECT
      p.*,
      TRIM(p.area) AS area,
      TRIM(p.city) AS city,
      TRIM(p.pincode) AS pincode,
      o.name AS organisation_name,
      o.name AS org_name,
      o.logo_url AS organisation_logo_url,
      o.logo_url AS org_logo_url,
      price_summary.property_min_price,
      price_summary.property_max_price,
      COALESCE(price_summary.priced_properties_count, 0) AS priced_properties_count,
      CONCAT_WS(
        ', ',
        NULLIF(TRIM(p.area), ''),
        NULLIF(TRIM(p.city), ''),
        NULLIF(TRIM(p.pincode), '')
      ) AS location
    FROM projects p
    LEFT JOIN organisations o ON o.id = p.organisation_id
    LEFT JOIN (
      SELECT
        pr.project_id,
        MIN(COALESCE(pp.base_price, pp.min_price, pp.max_price)) AS property_min_price,
        MAX(COALESCE(pp.base_price, pp.max_price, pp.min_price)) AS property_max_price,
        COUNT(*) FILTER (
          WHERE COALESCE(pp.base_price, pp.min_price, pp.max_price) IS NOT NULL
        ) AS priced_properties_count
      FROM properties pr
      LEFT JOIN property_pricing pp ON pp.property_id = pr.id
      GROUP BY pr.project_id
    ) price_summary ON price_summary.project_id = p.id
  `;
  res.json({ data: response });
};

export const getFeaturedProjects = async (req, res) => {
  try {
    const { city, area, pincode, limit = 10 } = req.query;

    // Build conditions and values separately
    const conditions = [`p.is_active = true AND p.is_featured = true`];
    const values = [];

    if (city) {
      values.push(city);
      conditions.push(`p.city = $${values.length + 1}`); // offset by 1 for limit
    }
    if (area) {
      values.push(area);
      conditions.push(`p.area = $${values.length + 1}`);
    }
    if (pincode) {
      values.push(pincode);
      conditions.push(`p.pincode = $${values.length + 1}`);
    }

    // Use sql.unsafe for the dynamic WHERE clause, parameterized values for user input
    const whereClause = conditions.join(" AND ");

    const response = await sql.unsafe(
      `
            SELECT 
                p.*,
                o.name AS organisation_name,
                o.name AS org_name,
                o.logo_url AS organisation_logo_url,
                o.logo_url AS org_logo_url,
                price_summary.property_min_price,
                price_summary.property_max_price,
                COALESCE(price_summary.priced_properties_count, 0) AS priced_properties_count,
                COUNT(prop.id) as total_properties
            FROM projects p
            LEFT JOIN organisations o ON o.id = p.organisation_id
            LEFT JOIN properties prop ON prop.project_id = p.id
            LEFT JOIN (
                SELECT
                    pr.project_id,
                    MIN(COALESCE(pp.base_price, pp.min_price, pp.max_price)) AS property_min_price,
                    MAX(COALESCE(pp.base_price, pp.max_price, pp.min_price)) AS property_max_price,
                    COUNT(*) FILTER (
                        WHERE COALESCE(pp.base_price, pp.min_price, pp.max_price) IS NOT NULL
                    ) AS priced_properties_count
                FROM properties pr
                LEFT JOIN property_pricing pp ON pp.property_id = pr.id
                GROUP BY pr.project_id
            ) price_summary ON price_summary.project_id = p.id
            WHERE ${whereClause}
            GROUP BY p.id, o.name, o.logo_url, price_summary.property_min_price, price_summary.property_max_price, price_summary.priced_properties_count
            ORDER BY total_properties DESC, p.created_at DESC
            LIMIT $1
            `,
      [limit, ...values],
    );

    res.json({ data: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ data: [], error: "Something went wrong" });
  }
};

export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    // ✅ Validate UUID (prevents crash)
    if (!isUUID(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const [project] = await sql`
            SELECT
                p.*,
                TRIM(p.area) AS area,
                TRIM(p.city) AS city,
                TRIM(p.pincode) AS pincode,
                CONCAT_WS(
                  ', ',
                  NULLIF(TRIM(p.area), ''),
                  NULLIF(TRIM(p.city), ''),
                  NULLIF(TRIM(p.pincode), '')
                ) AS location,
                o.name AS organisation_name,
                o.name AS org_name,
                o.logo_url AS organisation_logo_url,
                o.logo_url AS org_logo_url
            FROM projects p
            LEFT JOIN organisations o ON o.id = p.organisation_id
            WHERE p.id = ${projectId}
        `;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const variants = await sql`
            SELECT
                pr.id,
                pr.title,
                pr.property_subtype,
                pr.total_area_sqft,
                pr.bedrooms,
                pr.bathrooms,
                pr.status,
                pr.listing_type,
                pp.base_price,
                pp.is_negotiable,
                pp.currency,
                pm.url AS cover_image
            FROM properties pr
            LEFT JOIN property_pricing pp ON pp.property_id = pr.id
            LEFT JOIN property_media pm ON pm.property_id = pr.id AND pm.is_cover = true
            WHERE pr.project_id = ${projectId}
            ORDER BY pp.base_price ASC NULLS LAST
        `;

    res.status(200).json({
      success: true,
      data: { ...project, variants },
    });
  } catch (error) {
    console.error("Project API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectPriceRange = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!isUUID(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const [project] = await sql`
            WITH inventory_price_range AS (
                SELECT
                    project_id,
                    MIN(price) AS min_price,
                    MAX(price) AS max_price,
                    COUNT(*) AS priced_units_count
                FROM project_inventory_units
                WHERE project_id = ${projectId}
                  AND price IS NOT NULL
                  AND price > 0
                GROUP BY project_id
            )
            SELECT
                p.id,
                p.name,
                p.price_from,
                p.price_to,
                ipr.min_price AS inventory_min_price,
                ipr.max_price AS inventory_max_price,
                COALESCE(ipr.priced_units_count, 0) AS priced_units_count
            FROM projects p
            LEFT JOIN inventory_price_range ipr ON ipr.project_id = p.id
            WHERE p.id = ${projectId}
            LIMIT 1
        `;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const hasInventoryRange = Number(project.priced_units_count) > 0;
    const fallbackMinPrice =
      Number(project.price_from) > 0 ? project.price_from : null;
    const fallbackMaxPrice =
      Number(project.price_to) > 0 ? project.price_to : null;
    const minPrice = hasInventoryRange
      ? project.inventory_min_price
      : fallbackMinPrice;
    const maxPrice = hasInventoryRange
      ? project.inventory_max_price
      : fallbackMaxPrice;
    const hasPriceRange =
      minPrice !== null &&
      minPrice !== undefined &&
      maxPrice !== null &&
      maxPrice !== undefined;

    return res.status(200).json({
      success: true,
      message: "Project price range fetched successfully",
      data: {
        project_id: project.id,
        project_name: project.name,
        has_price_range: hasPriceRange,
        source: hasPriceRange
          ? hasInventoryRange
            ? "inventory_units"
            : "project_price_range"
          : null,
        priced_units_count: Number(project.priced_units_count),
        min_price: hasPriceRange ? Number(minPrice) : null,
        max_price: hasPriceRange ? Number(maxPrice) : null,
        min_price_display: hasPriceRange ? formatCurrency(minPrice) : null,
        max_price_display: hasPriceRange ? formatCurrency(maxPrice) : null,
        price_range_display: hasPriceRange
          ? buildPriceRangeDisplay(minPrice, maxPrice, formatCurrency)
          : null,
        price_range_short_display: hasPriceRange
          ? buildPriceRangeDisplay(minPrice, maxPrice, formatCompactCurrency)
          : null,
      },
    });
  } catch (error) {
    console.error("getProjectPriceRange Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectPossessionDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!isUUID(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const [project] = await sql`
            SELECT
                id,
                name,
                possession_status,
                possession_date,
                possession_remarks
            FROM projects
            WHERE id = ${projectId}
            LIMIT 1
        `;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const variants = await sql`
            SELECT
                id,
                title,
                property_subtype,
                possession_status,
                possession_date
            FROM properties
            WHERE project_id = ${projectId}
              AND (
                possession_status IS NOT NULL
                OR possession_date IS NOT NULL
              )
            ORDER BY title ASC
        `;

    const projectPossession =
      project.possession_date || project.possession_status || null;
    const variantPossessions = variants.map((variant) => ({
      property_id: variant.id,
      title: variant.title,
      property_subtype: variant.property_subtype,
      possession: variant.possession_date || variant.possession_status || null,
      possession_date: variant.possession_date,
      possession_status: variant.possession_status,
      source: variant.possession_date
        ? "properties.possession_date"
        : "properties.possession_status",
    }));

    return res.status(200).json({
      success: true,
      message: "Project possession details fetched successfully",
      data: {
        project_id: project.id,
        project_name: project.name,
        possession: projectPossession,
        possession_date: project.possession_date,
        possession_status: project.possession_status,
        possession_remarks: project.possession_remarks,
        source: project.possession_date
          ? "projects.possession_date"
          : project.possession_status
            ? "projects.possession_status"
            : null,
        field_sources: {
          project_possession_date: "projects.possession_date",
          project_possession_status: "projects.possession_status",
          project_possession_remarks: "projects.possession_remarks",
          variant_possession_date: "properties.possession_date",
          variant_possession_status: "properties.possession_status",
        },
        variants_count: variantPossessions.length,
        variants: variantPossessions,
      },
    });
  } catch (error) {
    console.error("getProjectPossessionDetails Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const compareProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;

    // ✅ Validate input
    if (!Array.isArray(projectIds) || projectIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 project IDs required for comparison",
      });
    }

    // ✅ Validate all UUIDs
    for (let id of projectIds) {
      if (!isUUID(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid project ID: ${id}`,
        });
      }
    }

    // ✅ Fetch projects
    const projects = await sql`
      SELECT id, name, city, description
      FROM public.projects
      WHERE id = ANY(${projectIds})
    `;

    // ✅ Check if all exist
    if (projects.length !== projectIds.length) {
      return res.status(404).json({
        success: false,
        message: "Some projects not found",
      });
    }

    // ✅ Response (structured for frontend compare UI)
    res.status(200).json({
      success: true,
      data: {
        count: projects.length,
        projects,
      },
    });
  } catch (error) {
    console.error("Compare API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//import sql from "../config/db.js";

export const filterProjects = async (req, res) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      config,
      status,
      limit = 10,
      page = 1,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build dynamic filters safely
    let conditions = [];
    let values = [];

    if (city) {
      conditions.push(sql`city ILIKE ${"%" + city + "%"}`);
    }

    if (minPrice) {
      conditions.push(sql`price_from >= ${minPrice}`);
    }

    if (maxPrice) {
      conditions.push(sql`price_to <= ${maxPrice}`);
    }

    if (status) {
      const isActive = status.toLowerCase() === "active";
      conditions.push(sql`is_active = ${isActive}`);
    }

    // Combine conditions
    const whereClause =
      conditions.length > 0
        ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
        : sql``;

    // Final query
    const projects = await sql`
      SELECT id, name, city, price_from, price_to, is_active
      FROM public.projects
      ${whereClause}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    res.status(200).json({
      success: true,
      data: {
        count: projects.length,
        page: Number(page),
        projects,
      },
    });
  } catch (error) {
    console.error("Filter API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBasicDetails = async (req, res) => {
  try {
    const {
      category,
      property_type,
      property_subtype,
      organisation_id,
      area,
      pincode,
      city,
    } = req.body;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!category || !property_type) {
      return res.status(400).json({
        success: false,
        message: "category and property_type are required",
      });
    }

    let finalOrganisationId = null;
    let finalBrokerId = null;

    // =========================
    // ORGANISATION PROJECT
    // =========================

    if (userRole === "broker") {
      finalBrokerId = userId;

      if (!finalBrokerId) {
        return res.status(400).json({
          success: false,
          message: "Broker ID missing",
        });
      }
    } else {
      finalOrganisationId =
        organisation_id || req.user?.organisation_id || userId;

      if (!finalOrganisationId) {
        return res.status(400).json({
          success: false,
          message: "organisation_id is required",
        });
      }
    }

    const result = await sql`
            INSERT INTO projects (
                category,
                property_type,
                property_subtype,

                organisation_id,
                broker_id,

                name,
                slug,
                city,
                area,
                pincode
            )
            VALUES (
                ${category},
                ${property_type},
                ${property_subtype || null},

                ${finalOrganisationId},
                ${finalBrokerId},

                ${"Draft Project " + Math.random().toString(36).substring(2, 8)},
                ${"draft-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8)},
                ${city},
                ${area},
                ${pincode}
            )
            RETURNING id
        `;

    return res.status(201).json({
      success: true,
      message: "Basic details created successfully",
      data: {
        id: result[0].id,
      },
    });
  } catch (error) {
    console.error("createBasicDetails Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOwnerDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { owner_name, owner_contact, owner_email, owner_address } = req.body;

    if (!isUUID(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid project ID" });
    }

    if (!owner_name || !owner_contact) {
      return res
        .status(400)
        .json({
          success: false,
          message: "owner_name and owner_contact are required",
        });
    }

    const result = await sql`
      UPDATE projects
      SET 
        owner_name = ${owner_name},
        owner_contact = ${owner_contact},
        owner_email = ${owner_email || null},
        owner_address = ${owner_address || null}
      WHERE id = ${projectId}
      RETURNING id
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Owner details updated successfully",
      data: {},
    });
  } catch (error) {
    console.error("updateOwnerDetails Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePropertyDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      name,
      tower_number,
      flat_number,
      location,
      city,
      state,
      pincode,
      nearby_project,
      khasra_number,
      property_age,
    } = req.body;

    if (!isUUID(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid project ID" });
    }

    if (!city || !state) {
      return res
        .status(400)
        .json({ success: false, message: "city and state are required" });
    }

    const result = await sql`
      UPDATE projects
      SET 
        name = ${name || null},
        tower_number = ${tower_number || null},
        flat_number = ${flat_number || null},
        location = ${location || null},
        city = ${city},
        state = ${state},
        pincode = ${pincode || null},
        nearby_project = ${nearby_project || null},
        khasra_number = ${khasra_number || null},
        property_age = ${property_age !== undefined ? property_age : null}
      WHERE id = ${projectId}
      RETURNING id
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Property details updated successfully",
      data: {},
    });
  } catch (error) {
    console.error("updatePropertyDetails Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAreaDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { total_area, carpet_area, area_unit } = req.body;

    if (!isUUID(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid project ID" });
    }

    const allowedUnits = [
      "sqft",
      "sqm",
      "acre",
      "hectare",
      "bigha",
      "biswa",
      "katha",
      "guntha",
      "cent",
      "kanal",
      "marla",
      "ankanam",
      "decimal",
      "gaj",
      "sqyd",
    ];

    if (area_unit && !allowedUnits.includes(area_unit)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid area_unit" });
    }

    const result = await sql`
      UPDATE projects
      SET 
        total_area = ${total_area !== undefined ? total_area : null},
        carpet_area = ${carpet_area !== undefined ? carpet_area : null},
        area_unit = ${area_unit || null}
      WHERE id = ${projectId}
      RETURNING id
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Area details updated successfully",
      data: {},
    });
  } catch (error) {
    console.error("updateAreaDetails Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addProjectMedia = async (req, res) => {
  try {
    const { projectId } = req.params;

    const uploadedBy = req.user?.id || null;

    // check project exists
    const projectCheck = await sql`
            SELECT id
            FROM projects
            WHERE id = ${projectId}
            LIMIT 1
        `;

    if (projectCheck.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const imageFiles = req.files?.images || [];
    const documentFiles = req.files?.documents || [];

    if (imageFiles.length === 0 && documentFiles.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one file",
      });
    }

    const uploadedMedia = [];

    // =========================
    // IMAGES
    // =========================
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];

      const extension = file.originalname.split(".").pop();

      const fileName = `${Date.now()}-${i}.${extension}`;

      const path = await uploadToSupabase({
        file,
        folder: `project-images/${projectId}`,
        fileName,
      });

      const result = await sql`
                INSERT INTO project_media (
                    project_id,
                    media_type,
                    url,
                    sort_order,
                    is_cover,
                    uploaded_by
                )
                VALUES (
                    ${projectId},
                    'image',
                    ${path},
                    ${i},
                    ${i === 0},
                    ${uploadedBy}
                )
                RETURNING *
            `;

      uploadedMedia.push(result[0]);
    }

    // =========================
    // DOCUMENTS
    // =========================
    for (let i = 0; i < documentFiles.length; i++) {
      const file = documentFiles[i];

      const extension = file.originalname.split(".").pop();

      const fileName = `${Date.now()}-doc-${i}.${extension}`;

      const path = await uploadToSupabase({
        file,
        folder: `project-documents/${projectId}`,
        fileName,
      });

      const result = await sql`
                INSERT INTO project_media (
                    project_id,
                    media_type,
                    url,
                    sort_order,
                    uploaded_by,
                    label
                )
                VALUES (
                    ${projectId},
                    'document',
                    ${path},
                    ${i},
                    ${uploadedBy},
                    ${file.originalname}
                )
                RETURNING *
            `;

      uploadedMedia.push(result[0]);
    }

    return res.status(201).json({
      message: "Project media uploaded successfully",
      data: uploadedMedia,
    });
  } catch (error) {
    console.error("Upload project media error:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!isUUID(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const {
      category,
      property_type,
      property_subtype,

      owner_name,
      owner_contact,
      owner_email,
      owner_address,

      name,
      tower_number,
      flat_number,
      location,
      city,
      state,
      pincode,
      nearby_project,
      khasra_number,
      property_age,

      total_area,
      carpet_area,
      area_unit,
    } = req.body;

    const result = await sql`
            UPDATE projects
            SET
                category = COALESCE(${category}, category),
                property_type = COALESCE(${property_type}, property_type),
                property_subtype = COALESCE(${property_subtype}, property_subtype),

                owner_name = COALESCE(${owner_name}, owner_name),
                owner_contact = COALESCE(${owner_contact}, owner_contact),
                owner_email = COALESCE(${owner_email}, owner_email),
                owner_address = COALESCE(${owner_address}, owner_address),

                name = COALESCE(${name}, name),
                tower_number = COALESCE(${tower_number}, tower_number),
                flat_number = COALESCE(${flat_number}, flat_number),
                location = COALESCE(${location}, location),
                city = COALESCE(${city}, city),
                state = COALESCE(${state}, state),
                pincode = COALESCE(${pincode}, pincode),
                nearby_project = COALESCE(${nearby_project}, nearby_project),
                khasra_number = COALESCE(${khasra_number}, khasra_number),
                property_age = COALESCE(${property_age}, property_age),

                total_area = COALESCE(${total_area}, total_area),
                carpet_area = COALESCE(${carpet_area}, carpet_area),
                area_unit = COALESCE(${area_unit}, area_unit),

                updated_at = NOW()

            WHERE id = ${projectId}
            RETURNING id
        `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: {},
    });
  } catch (error) {
    console.error("updateProject Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!isUUID(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    // check project exists
    const project = await sql`
            SELECT id
            FROM projects
            WHERE id = ${projectId}
            LIMIT 1
        `;

    if (project.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // get media
    const media = await sql`
            SELECT id, url
            FROM project_media
            WHERE project_id = ${projectId}
        `;

    // delete from storage
    for (const item of media) {
      try {
        await deleteFromSupabase(item.url);
      } catch (err) {
        console.log("Media delete failed:", err);
      }
    }

    // delete media records
    await sql`
            DELETE FROM project_media
            WHERE project_id = ${projectId}
        `;

    // delete project
    await sql`
            DELETE FROM projects
            WHERE id = ${projectId}
        `;

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("deleteProject Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNearbyProjects = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message:
          "latitude and longitude are required and must be valid numbers",
      });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message:
          "latitude must be between -90 and 90, longitude between -180 and 180",
      });
    }

    const projects = await sql`
            WITH nearby AS (
                SELECT
                    p.*,
                    ROUND(
                        CAST(
                            6371000 * acos(
    GREATEST(
        -1.0,
        LEAST(
            1.0,
            cos(radians(${lat})) * cos(radians(p.latitude)) *
            cos(radians(p.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(p.latitude))
        )
    )
) AS numeric
                        ), 0
                    ) AS distance_meters
                FROM projects p
                WHERE
                    p.is_active = true
                    AND p.latitude IS NOT NULL
                    AND p.longitude IS NOT NULL
            )
            SELECT
                *,
                ROUND(CAST(distance_meters / 1000.0 AS numeric), 2) AS distance_km
            FROM nearby
            WHERE distance_meters <= 20000
            ORDER BY distance_meters ASC
        `;

    return res.status(200).json({
      success: true,
      data: {
        count: projects.length,
        projects,
      },
    });
  } catch (error) {
    console.error("getNearbyProjects Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectPriceTrajectory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { period = '3Y' } = req.query;

    if (!isUUID(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const [project] = await sql`
      SELECT id, name, price_from, price_to FROM projects WHERE id = ${projectId} LIMIT 1
    `;

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const periodMap = { '1Y': 1, '3Y': 3, '5Y': 5 };
    const years = periodMap[period] ?? 3;

    const history = await sql`
      SELECT price_per_sqft, min_price, max_price, recorded_at
      FROM project_price_history
      WHERE project_id = ${projectId}
        AND recorded_at >= NOW() - (${years} || ' years')::INTERVAL
      ORDER BY recorded_at ASC
    `;

    let appreciation_pct = null;
    if (history.length >= 2) {
      const first = Number(history[0].price_per_sqft ?? history[0].min_price);
      const last = Number(history[history.length - 1].price_per_sqft ?? history[history.length - 1].min_price);
      if (first > 0) {
        appreciation_pct = Number(((last - first) / first * 100).toFixed(1));
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        project_id: projectId,
        project_name: project.name,
        period,
        appreciation_pct,
        current_price_from: project.price_from !== null ? Number(project.price_from) : null,
        current_price_to: project.price_to !== null ? Number(project.price_to) : null,
        history: history.map(h => ({
          price_per_sqft: h.price_per_sqft !== null ? Number(h.price_per_sqft) : null,
          min_price: h.min_price !== null ? Number(h.min_price) : null,
          max_price: h.max_price !== null ? Number(h.max_price) : null,
          recorded_at: h.recorded_at,
        })),
      },
    });
  } catch (error) {
    console.error("getProjectPriceTrajectory Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProjectMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;

    if (!isUUID(mediaId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID",
      });
    }

    const media = await sql`
            SELECT *
            FROM project_media
            WHERE id = ${mediaId}
            LIMIT 1
        `;

    if (media.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // delete file from storage
    await deleteFromSupabase(media[0].url);

    // delete db record
    await sql`
            DELETE FROM project_media
            WHERE id = ${mediaId}
        `;

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("deleteProjectMedia Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProjectMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { is_cover, sort_order, label } = req.body;

    if (!isUUID(mediaId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID",
      });
    }

    const media = await sql`
            SELECT *
            FROM project_media
            WHERE id = ${mediaId}
            LIMIT 1
        `;

    if (media.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // if setting cover image
    if (is_cover === true) {
      await sql`
                UPDATE project_media
                SET is_cover = false
                WHERE project_id = ${media[0].project_id}
            `;
    }

    await sql`
            UPDATE project_media
            SET
                is_cover = COALESCE(${is_cover}, is_cover),
                sort_order = COALESCE(${sort_order}, sort_order),
                label = COALESCE(${label}, label)
            WHERE id = ${mediaId}
        `;

    return res.status(200).json({
      success: true,
      message: "Media updated successfully",
    });
  } catch (error) {
    console.error("updateProjectMedia Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
