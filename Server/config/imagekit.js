import dotenv from 'dotenv';
dotenv.config();
import ImageKit from '@imagekit/nodejs';


const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

if (!process.env.IMAGEKIT_PRIVATE_KEY ) {
    console.warn(" Warning: ImageKit credentials are completely or partially missing from process.env!");
}

export default imagekit;