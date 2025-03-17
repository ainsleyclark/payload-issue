import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload, Payload, PayloadRequest } from 'payload'
import config from '@payload-config';
import { faker } from '@faker-js/faker';
import fs from 'fs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const CENTRES_AMOUNT = 12000;
const MEDIA_ITEMS_AMOUNT = 95000;

export const seed = async () => {
  const payload = await getPayload({ config });
  const req = { payload } as PayloadRequest;
  const mediaItems = await createMediaItems(payload, MEDIA_ITEMS_AMOUNT);

  for (let i = 0; i < CENTRES_AMOUNT; i++) {
    const centreData = {
      name: faker.company.name(),
      featuredImage: mediaItems[Math.floor(Math.random() * mediaItems.length)].id,
      logo: mediaItems[Math.floor(Math.random() * mediaItems.length)].id,
      images: Array(3).fill(null).map(() => mediaItems[Math.floor(Math.random() * mediaItems.length)].id),
    };
    const centre = await payload.create({ collection: 'centres', data: centreData });
    payload.logger.info(`✅ Created Centre Item ID: ${centre.id}. Remaining: ${CENTRES_AMOUNT - i - 1}`);
  }

  payload.logger.info(`✅ Successfully seeded`);
};

const createMediaItems = async (payload: Payload, amount: number) => {
  const mediaItems = [];
  for (let i = 0; i < amount; i++) {
    const randomImageUrl = `https://picsum.photos/500/500?random=${Math.random()}`;
    const imageBuffer = await fetchImageBuffer(randomImageUrl);
    if (!imageBuffer) continue;

    const localFilePath = path.resolve(dirname, `image-${i}.jpg`);
    fs.writeFileSync(localFilePath, imageBuffer);

    try {
      const uploadedMediaItem = await payload.create({
        collection: 'media',
        data: { alt: faker.lorem.words(3) },
        filePath: localFilePath,
      });
      mediaItems.push(uploadedMediaItem);

      payload.logger.info(`✅ Created Media Item ID: ${uploadedMediaItem.id}. Remaining: ${amount - i - 1}`);

      fs.unlinkSync(localFilePath);
    } catch (error) {
      console.error(`Error uploading media item for index ${i}:`, error);
    }
  }
  return mediaItems;
};

const fetchImageBuffer = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
};

await seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
