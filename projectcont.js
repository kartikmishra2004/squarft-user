import sql from '../config/db.js';

export const getProjectDetails = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const result = await sql`
      WITH project_info AS (
        SELECT 
          p.id,
          p.name,
          p.description,
          TRIM(p.city) AS city,
          TRIM(p.area) AS area,
          TRIM(p.pincode) AS pincode,
          p.latitude,
          p.longitude,
          p.cover_image_url,
          p.price_from,
          p.price_to,
          p.created_at,
          p.rera_approved,
          p.rera_number,
          p.possession_status,
          o.id AS org_id, o.name AS org_name, o.logo_url AS org_logo_url
        FROM projects p
        LEFT JOIN organisations o ON p.organisation_id = o.id
        WHERE p.slug = ${slug} AND p.is_active = true
      ),
      property_summary AS (
        SELECT
          pr.project_id,

          COUNT(pr.id) AS units,

          STRING_AGG(
            DISTINCT CONCAT(pr.bedrooms, ' BHK'),
            ', '
          ) FILTER (
            WHERE pr.bedrooms IS NOT NULL
          ) AS configs,

          MIN(
            COALESCE(
              pp.base_price,
              pp.min_price,
              pp.max_price
            )
          ) AS starting_from

        FROM properties pr
        LEFT JOIN property_pricing pp
          ON pp.property_id = pr.id

        GROUP BY pr.project_id
      ),
      -- Calculate Rating out of 10 based on 5-star reviews
      project_rating AS (
        SELECT pr.project_id, COALESCE(ROUND(AVG(r.rating) * 2, 1), 0) as score
        FROM properties pr
        LEFT JOIN reviews r ON pr.id = r.property_id
        WHERE pr.project_id = (SELECT id FROM project_info)
        GROUP BY pr.project_id
      )
      SELECT 
        pi.*,
        pr.score as rating,
        ps.units,
        ps.configs,
        ps.starting_from
      FROM project_info pi
      LEFT JOIN property_summary ps
        ON ps.project_id = pi.id

      LEFT JOIN project_rating pr
        ON pi.id = pr.project_id
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const p = result[0];
    res.json({
      success: true,
      data: {
        id: p.id,
        name: p.name,
        area: p.area,
        city: p.city,
        pincode: p.pincode,
        latitude: p.latitude,
        longitude: p.longitude,
        location: [p.area, p.city, p.pincode].filter(Boolean).join(', '),
        description: p.description,
        cover_image: p.cover_image_url,
        rera_id: p.rera_number || null,
        rera_approved: Boolean(p.rera_approved),
        rating: p.rating > 0 ? p.rating : 8.8, 
        developer: { name: p.org_name, logo: p.org_logo_url, id: p.org_id },
        possession: p.possession_status || null, 
        brochure: null,
        stats: {
          units: Number(p.units) || 0,
          launched: p.created_at
        },
        summary: {
        configs: p.configs,
        starting_from: p.starting_from
        },
        price_from: p.price_from,
        price_to: p.price_to,
        configs: p.configs,
        starting_from: p.starting_from,
      }
    });
  } catch (err) { 
    next(err); 
  }
};


export const getProjectFloorPlans = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const result = await sql`
      SELECT 
        pr.id, pr.title, pr.bedrooms, pr.total_area_sqft, pr.tower_no,
        COALESCE(pp.base_price, pp.min_price, pp.max_price) as price,
        pp.base_price,
        (SELECT url FROM property_media WHERE property_id = pr.id AND is_cover = true LIMIT 1) as floor_plan_url
      FROM properties pr
      LEFT JOIN property_pricing pp ON pr.id = pp.property_id
      WHERE pr.project_id = (
        SELECT id
        FROM projects
        WHERE slug = ${slug}
      )
      ORDER BY pr.bedrooms ASC
    `;
    const propertyIds = result.map(r => r.id);
    const amenitiesResult = propertyIds.length
      ? await sql`
          SELECT
            pa.property_id,
            a.id,
            a.name,
            a.icon,
            a.category
          FROM property_amenities pa
          JOIN amenities a
            ON a.id = pa.amenity_id
          WHERE pa.property_id = ANY(${propertyIds})
        `
      : [];
      const amenitiesMap = {};

    for (const row of amenitiesResult) {
      if (!amenitiesMap[row.property_id]) {
        amenitiesMap[row.property_id] = [];
      }

      amenitiesMap[row.property_id].push({
        id: row.id,
        name: row.name,
        icon: row.icon,
        category: row.category
      });
    }
    const configs = [
      ...new Set(
        result
          .filter(r => r.bedrooms != null)
          .map(r => `${r.bedrooms} BHK`)
      )
    ];
    const prices = result.map(r => Number(r.price)).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    res.json({
      success: true,
      data: {
        summary: { 
          configs: configs.join(', '), 
          starting_from: minPrice 
        },
        floor_plans: result.map(r => ({
          id: r.id,
          title: r.title,
          bedrooms: r.bedrooms,
          area_sqft: r.total_area_sqft,
          area: r.total_area_sqft
            ? `${r.total_area_sqft} sqft`
            : null,
          price: r.price,
          base_price: r.base_price,
          tower_no: r.tower_no ,
          amenities: amenitiesMap[r.id] || [],
          image: r.floor_plan_url || null
        }))
      }
    });
  } catch (err) { 
    next(err); 
  }
};


export const getProjectResale = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const result = await sql`
      SELECT 
        pr.id, pr.title, pr.area, pr.city, pr.bedrooms, pp.base_price,
        (SELECT url FROM property_media WHERE property_id = pr.id AND is_cover = true LIMIT 1) as cover_image
      FROM properties pr
      LEFT JOIN property_pricing pp ON pr.id = pp.property_id
      WHERE pr.project_id = (SELECT id FROM projects WHERE slug = ${slug})
      AND pr.listing_type = 'buy' AND pr.status = 'published'
    `;

    res.json({ success: true, data: result });
  } catch (err) { 
    next(err); 
  }
};

export const getSimilarProperties = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const result = await sql`
      SELECT 
        pr.id, pr.title, pr.area, pr.city, pr.bedrooms, pp.base_price,
        (SELECT url FROM property_media WHERE property_id = pr.id AND is_cover = true LIMIT 1) as cover_image
      FROM properties pr
      LEFT JOIN property_pricing pp ON pr.id = pp.property_id
      WHERE pr.city = (SELECT city FROM projects WHERE slug = ${slug})
      AND pr.project_id != (SELECT id FROM projects WHERE slug = ${slug})
      AND pr.status = 'published'
      LIMIT 5
    `;
    res.json({ success: true, data: result });
  } catch (err) { 
    next(err); 
  }
};

