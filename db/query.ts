export default {
    addUser: 'INSERT INTO user(name, type, passcode, passrd) VALUES(?,?,?,?)',
    queryUserWithLimit: 'SELECT * FROM user WHERE type <= ? AND deleted = 0 LIMIT ?,?',
    countQueryUserWithLimit: 'SELECT COUNT(*) FROM user WHERE type <= ? AND deleted = 0',
    getUserById: 'SELECT * FROM user WHERE id=? AND deleted = 0',
    searchUserWithLimited: 'SELECT * FROM user WHERE type <= ? AND (POSITION(? IN name) OR POSITION(? IN id)) AND deleted = 0 LIMIT ?,?',
    countSearchUserWithLimited: 'SELECT COUNT(*) FROM user WHERE type <= ? AND (POSITION(? IN name) OR POSITION(? IN id)) AND deleted = 0',
    resetPassword: 'UPDATE user SET passcode=?, passrd=? WHERE id=? AND deleted = 0',
    deleteUser: 'UPDATE user SET deleted = 1 WHERE id=?',
    resetUserType: 'UPDATE user SET type=? WHERE id=? AND deleted = 0',
    resetUserName: 'UPDATE user SET name=? WHERE id=? AND deleted = 0',
    addPhoto: 'INSERT INTO photo(uploader_id, type, date) VALUES(?, 0, now())',
    updatePhoto: 'UPDATE photo SET type=1 WHERE id=? AND deleted = 0',
    publishPhoto: 'UPDATE photo SET type=2, name=? WHERE id=? AND deleted = 0',
    queryUnPublishedPhotoWithLimit: 'SELECT photo.id as id, photo.type as type, photo.name as name, photo.uploader_id as uploader_id, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countQueryUnPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND photo.deleted = 0',
    searchUnPublishedPhotoWithLimit: 'SELECT photo.id as id, photo.type as type, photo.name as name, photo.uploader_id as uploader_id, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countSearchUnPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0',
    getPhotoById: 'SELECT photo.id as id, photo.type as type, photo.name as name, photo.uploader_id as uploader_id, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE photo.id = ? AND photo.deleted = 0',
    getDownloadByPhotoId: 'SELECT * from download where photo_id = ?',
    deletePhoto: 'UPDATE photo SET deleted = 1 WHERE id = ?',
};