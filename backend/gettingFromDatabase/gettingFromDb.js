const { pool } = require("../database/database");

/**
 * @function to get the movie or tv shows or trending list of data from the db
 * @returns the array of object containing
 */
const fetchAllTrendingData = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM AllTrending");
    return result.rows;
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    throw new Error("Failed to fetch data from the database.");
  } finally {
    client.release();
  }
};

/**
 * @function to get the movie or tv shows or trending list of data from the db
 * @param {Number} id of the selected movie or tv shows
 * @returns object that conatins details
 */
const fetchDetailsData = async (id) => {
  const client = await pool.connect();

  try {
    const detailsQuery = `
        SELECT * FROM Details WHERE id = $1;
      `;
    const res = await client.query(detailsQuery, [id]);

    if (!res.rows[0]) {
      throw new Error(`Details not found for id: ${id}`);
    }

    const details = res.rows[0];

    const companiesQuery = `
        SELECT c.id, c.logo_path, c.name
        FROM CompanyDetails c
        JOIN Details_Companies dc ON dc.company_id = c.id
        WHERE dc.detail_id = $1;
      `;
    const companiesRes = await client.query(companiesQuery, [id]);
    details.production_companies = companiesRes.rows || [];

    const genresQuery = `
        SELECT g.id, g.name
        FROM Genre g
        JOIN Details_Genres dg ON dg.genre_id = g.id
        WHERE dg.detail_id = $1;
      `;
    const genresRes = await client.query(genresQuery, [id]);
    details.genres = genresRes.rows || [];

    const languagesQuery = `
        SELECT l.id, l.english_name, l.name
        FROM Language l
        JOIN Details_Languages dl ON dl.language_id = l.id
        WHERE dl.detail_id = $1;
      `;
    const languagesRes = await client.query(languagesQuery, [id]);
    details.spoken_languages = languagesRes.rows || [];

    return details;
  } catch (err) {
    console.error("Error fetching data:", err);
    throw new Error("Failed to fetch inserted data.");
  } finally {
    client.release();
  }
};

/**
 *
 * @param {Number} id of the slected movie or tv shows
 * @returns array of the review list
 */
const getReviews = async (id) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT author_name, username, avatar_path, rating, content, created_at, type, reference_id FROM Reviews WHERE reference_id = $1",
      [id]
    );

    const reviews = result.rows.map((row) => ({
      author_details: {
        name: row.author_name,
        username: row.username,
        avatar_path: row.avatar_path,
        rating: row.rating,
      },
      content: row.content,
      created_at: row.created_at.toISOString(),
    }));

    return reviews;
  } catch (err) {
    console.error("Error fetching reviews:", err);
    throw new Error("Failed to fetch reviews.");
  } finally {
    client.release();
  }
};

// const getCredits = async (id) => {
//   const client = await pool.connect();

//   try {
//     // Query to get the general credits info
//     const creditQuery = `
//       SELECT c.id, c.reference_id, c.type
//       FROM Credits c
//       WHERE c.reference_id = $1
//     `;
//     const creditResult = await client.query(creditQuery, [id]);

//     if (creditResult.rows.length === 0) {
//       throw new Error("No credit data found for this reference_id.");
//     }

//     const creditData = creditResult.rows[0];

//     // Query to get cast info
//     const castQuery = `
//       SELECT ca.name, ca.character, ca.gender, ca.profile_path, ca.popularity, ca.credit_id
//       FROM Casts ca
//       WHERE ca.reference_id = $1
//     `;
//     const castResult = await client.query(castQuery, [id]);
//     const cast = castResult.rows.map((row) => ({
//       adult: false, // Assuming the data for 'adult' is not present, can be set as per your needs
//       gender: row.gender,
//       id: row.credit_id,
//       known_for_department: "Acting", // Assuming all are acting, adjust as necessary
//       name: row.name,
//       original_name: row.name,
//       popularity: row.popularity,
//       profile_path: row.profile_path,
//       cast_id: row.credit_id, // Assuming credit_id is same as cast_id
//       character: row.character,
//       credit_id: row.credit_id, // Same credit_id for the cast
//       order: 0, // Assuming order is 0, you can modify this field as per actual data
//     }));

//     // Query to get crew info
//     const crewQuery = `
//       SELECT cr.name, cr.job, cr.department, cr.gender, cr.profile_path, cr.popularity, cr.credit_id
//       FROM Crew cr
//       WHERE cr.reference_id = $1
//     `;
//     const crewResult = await client.query(crewQuery, [id]);
//     const crew = crewResult.rows.map((row) => ({
//       adult: false, // Assuming the data for 'adult' is not present, can be set as per your needs
//       gender: row.gender,
//       id: row.credit_id,
//       known_for_department: row.department, // Assuming department as the known for department
//       name: row.name,
//       original_name: row.name,
//       popularity: row.popularity,
//       profile_path: row.profile_path,
//       credit_id: row.credit_id,
//       department: row.department,
//       job: row.job,
//     }));

//     // Construct the final response in the desired format
//     const response = {
//       id: creditData.reference_id,
//       cast: cast,
//       crew: crew,
//     };

//     return response;
//   } catch (err) {
//     console.error("Error fetching credits:", err);
//     throw new Error("Failed to fetch credits.");
//   } finally {
//     client.release();
//   }
// };

/**
 * @function to get the credit of the selected movie or tv shows
 * @param {Number} id of the slected movie or tv shows
 * @returns object that contained id and array of object for cast and crew
 */
const getCreditData = async (creditId) => {
  const client = await pool.connect();
  try {
    const crewResult = await client.query(
      `
      SELECT 
        json_agg(
          json_build_object(
            'id', cr.crew_id,
            'name', cr.name,
            'profile_path', cr.profile_path,
            'job', cr.job
          )
        ) AS crew
      FROM crew cr
      INNER JOIN credits c ON c.id = cr.credit_id
      WHERE c.credit_id = $1
      `,
      [creditId]
    );

    const castResult = await client.query(
      `
      SELECT 
        json_agg(
          json_build_object(
            'id', ca.cast_id,
            'name', ca.name,
            'profile_path', ca.profile_path,
            'character', ca.character
          )
        ) AS cast
      FROM casts ca
      INNER JOIN credits c ON c.id = ca.credit_id
      WHERE c.credit_id = $1
      `,
      [creditId]
    );

    const creditResult = await client.query(
      `
      SELECT credit_id AS creditId
      FROM credits
      WHERE credit_id = $1
      `,
      [creditId]
    );

    if (creditResult.rows.length === 0) {
      throw new Error("Credit not found");
    }
    return {
      creditId: creditResult.rows[0].creditid,
      crew: crewResult.rows[0].crew || [],
      cast: castResult.rows[0].cast || [],
    };
  } catch (error) {
    console.error("Error fetching credit data:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  fetchAllTrendingData,
  fetchDetailsData,
  getReviews,
  // getCredits,
  getCreditData,
};
