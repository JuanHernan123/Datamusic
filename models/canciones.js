const cancionesModel = {
    getAll:`
        SELECT
              *
        FROM
             canciones
       `,
       getByID:`
          SELECT
                *
            FROM
                 canciones
            WHERE
                id=?
      `,
      getBycanciones:`
                   SELECT
                        *
                   FROM
                          canciones
                  WHERE
                         cancion = ?

                       `,
                       addRow:`
            INSERT INTO
                canciones(
                    password,
                    cancion,
                    minutos,
                    artista,
                    genero,
                    fechadelanzamiento,
                    is_active

                    )VALUES(                                                                                                                                                 
                         ?,?,?,?,?,?,?
                    )
                 `,
                 updateRow:`
                      UPDATE
                           canciones
                        SET
                        password = ?,
                        cancion =?,
                        minutos =?,
                        artista =?,
                        genero =?,
                        fechadelanzamiento =?,
                        is_active =?
                  WHERE
                       id = ?
                 `,
                 deleteRow:`
                      UPDATE
                        canciones
                      SET 
                          is_active = 0
                      WHERE
                           id = ?
                           `,

}

module.exports = cancionesModel;