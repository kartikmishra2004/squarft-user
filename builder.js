import sql from "../config/db.js";

export const getBuilderDetails = async (req, res) => {
  try {
    const { builderId } = req.params;

    // 1️⃣ Get Builder
    const builderResult = await sql`
      SELECT id, name, logo_url, city
      FROM organisations
      WHERE id = ${builderId}
      LIMIT 1
    `;

    const builder = builderResult[0];

    if (!builder) {
      return res.status(404).json({
        success: false,
        message: "Builder not found",
      });
    }

    // 2️⃣ Get Projects using builder.id
    const projects = await sql`
      SELECT
        p.*,
        STRING_AGG(
          DISTINCT CONCAT(pr.bedrooms, ' BHK'),
          ', '
        ) FILTER (WHERE pr.bedrooms IS NOT NULL) AS configs
      FROM projects p
      LEFT JOIN properties pr ON pr.project_id = p.id
      WHERE p.organisation_id = ${builder.id}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    // 3️⃣ Response
    res.status(200).json({
      success: true,
      data: {
        builder: {
          id: builder.id,
          name: builder.name,
          logo_url: builder.logo_url,
          city: builder.city,
        },
        totalProjects: projects.length,
        projects,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
