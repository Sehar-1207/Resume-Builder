import multer from 'multer';

const storsge = multer.diskStorage({});
const upload = multer({storage});
export default upload;