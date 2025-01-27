const { pool } = require("../database/database");

/**
 * @function it is used to insert the data(trending,movie,tv,smiliar,recommended) to the table
 * @param it take array of objects, in which some details about the movie or tv show are stored
 * @working before inserting new data into the db it firstly delete the previous one and then insert the new one.
 */
const insertTrendingData = async (data) => {
  const query = `
      INSERT INTO AllTrending (
        id,title, name, backdrop_path, profile_path, poster_path,
        release_date, first_air_date, vote_average, vote_count, media_type, popularity
      ) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12)
      RETURNING id;`;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM AllTrending");

    for (const row of data) {
      const {
        id,
        title,
        name,
        backdrop_path,
        profile_path = null,
        poster_path,
        release_date,
        first_air_date = null,
        vote_average,
        vote_count,
        media_type,
        popularity,
      } = row;

      const values = [
        id,
        title,
        name,
        backdrop_path,
        profile_path,
        poster_path,
        release_date,
        first_air_date,
        vote_average,
        vote_count,
        media_type,
        popularity,
      ];

      const res = await client.query(query, values);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error inserting data:", err);
  } finally {
    client.release();
  }
};

/**
 * @function it is userd to insert the particular movie or tv details
 * @params it take an object which contain the details of the that movie or tv show
 * @working before inserting new data into the db it first delete the previous one and then insert the new one.
 */
const insertDetailsData = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM Details_Companies");
    await client.query("DELETE FROM Details_Genres");
    await client.query("DELETE FROM Details_Languages");
    await client.query("DELETE FROM Details");
    await client.query("DELETE FROM CompanyDetails");
    await client.query("DELETE FROM Genre");
    await client.query("DELETE FROM Language");

    const detailsQuery = `
        INSERT INTO Details (
         id, backdrop_path, poster_path, title, name, overview, release_date, first_air_date, 
          vote_average, media_type, runtime
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11) RETURNING id;
      `;

    const {
      id,
      backdrop_path,
      poster_path,
      title,
      name,
      overview,
      release_date,
      first_air_date,
      vote_average,
      media_type,
      runtime,
    } = data;

    const detailsValues = [
      id,
      backdrop_path,
      poster_path,
      title,
      name,
      overview,
      release_date,
      first_air_date,
      vote_average,
      media_type,
      runtime,
    ];

    const res = await client.query(detailsQuery, detailsValues);
    const detailId = res.rows[0].id;

    for (const company of data.production_companies) {
      const companyQuery = `
          INSERT INTO CompanyDetails (logo_path, name) VALUES ($1, $2) 
          ON CONFLICT (name) DO NOTHING RETURNING id;
        `;
      const companyRes = await client.query(companyQuery, [
        company.logo_path,
        company.name,
      ]);
      const companyId = companyRes.rows[0]?.id;

      if (companyId) {
        const companyLinkQuery = `
            INSERT INTO Details_Companies (detail_id, company_id) 
            VALUES ($1, $2) 
            ON CONFLICT (detail_id, company_id) DO NOTHING;
          `;
        await client.query(companyLinkQuery, [detailId, companyId]);
      }
    }

    for (const genre of data.genres) {
      const genreQuery = `
          INSERT INTO Genre (name) VALUES ($1) 
          ON CONFLICT (name) DO NOTHING RETURNING id;
        `;
      const genreRes = await client.query(genreQuery, [genre.name]);
      const genreId = genreRes.rows[0]?.id;

      if (genreId) {
        const genreLinkQuery = `
            INSERT INTO Details_Genres (detail_id, genre_id) 
            VALUES ($1, $2) 
            ON CONFLICT (detail_id, genre_id) DO NOTHING;
          `;
        await client.query(genreLinkQuery, [detailId, genreId]);
      }
    }

    for (const language of data.spoken_languages) {
      const languageQuery = `
          INSERT INTO Language (english_name, name) VALUES ($1, $2) 
          ON CONFLICT (name) DO NOTHING RETURNING id;
        `;
      const languageRes = await client.query(languageQuery, [
        language.english_name,
        language.name,
      ]);
      const languageId = languageRes.rows[0]?.id;

      if (languageId) {
        const languageLinkQuery = `
            INSERT INTO Details_Languages (detail_id, language_id) 
            VALUES ($1, $2) 
            ON CONFLICT (detail_id, language_id) DO NOTHING;
          `;
        await client.query(languageLinkQuery, [detailId, languageId]);
      }
    }

    await client.query("COMMIT");

    const result = await client.query(
      `
        SELECT * FROM Details WHERE id = $1;
      `,
      [detailId]
    );

    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error inserting data:", err);
    throw new Error("Error inserting data");
  } finally {
    client.release();
  }
};

/**
 * @function it is used to insert the movie or tv show reviews
 * @param {*} type it describe or hold i.e., it is movie or show/tv
 * @param {*} id it hold the movie or tv show id
 * @param {*} reviews it contain the array of object which have a review of that particular movie or tv show have.
 * @working before inserting new data into the db it first delete the previous one and then insert the new one.
 */
const insertReviews = async (type, id, reviews) => {
  const client = await pool.connect();

  try {
    await client.query("DELETE FROM Reviews");
    console.log(id, "Review");
    const insertQuery = `
        INSERT INTO Reviews (author_name, username, avatar_path, rating, content, created_at, type, reference_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

    for (let review of reviews) {
      const { author_details, content, created_at } = review;

      const { name, username, avatar_path, rating } = author_details || {};

      const createdAtTimestamp = new Date(parseInt(created_at));

      await client.query(insertQuery, [
        name || null,
        username || null,
        avatar_path || null,
        rating || null,
        content,
        createdAtTimestamp,
        type,
        id,
      ]);
    }
  } catch (err) {
    console.error("Error inserting reviews:", err);
  } finally {
    client.release();
  }
};

/**
 * @function it is used to insert the credit details of the cast and crew of that particular movie or tv show
 * @param {*} id it hold the movie or tv id
 * @param {*} castArray it is a array of object of casts
 * @param {*} crewArray it is a array of object of crew
 * @working before inserting new data into the db it first delete the previous one and then insert the new one.
 */
const insertCreditData = async (creditId, castArray, crewArray) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM crew ");
    await client.query("DELETE FROM casts ");
    await client.query("DELETE FROM credits ");

    const creditResult = await client.query(
      "INSERT INTO credits (credit_id) VALUES ($1) RETURNING id",
      [creditId]
    );
    const creditDbId = creditResult.rows[0].id;

    for (const crew of crewArray) {
      await client.query(
        `INSERT INTO crew (crew_id, name, profile_path, job, credit_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [crew.id, crew.name, crew.profile_path, crew.job, creditDbId]
      );
    }

    for (const cast of castArray) {
      await client.query(
        `INSERT INTO casts (cast_id, name, profile_path, character, credit_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [cast.id, cast.name, cast.profile_path, cast.character, creditDbId]
      );
    }

    await client.query("COMMIT");
    console.log("Data inserted successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error inserting data:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  insertTrendingData,
  insertDetailsData,
  insertReviews,
  insertCreditData,
};
