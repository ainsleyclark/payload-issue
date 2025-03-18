import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload } from 'payload'
import config from '@payload-config';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import { Media } from '@/payload-types'
import pLimit from 'p-limit';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const CENTRES_AMOUNT = 12000;
const MEDIA_ITEMS_AMOUNT = 95000;
const MEDIA_CONCURRENCY = 20;
const CENTRES_CONCURRENCY = 20;

export const seed = async () => {
  const payload = await getPayload({ config });
  const logger = payload.logger;

  /************************************
   User
   ************************************/
  await payload.create({
    collection: 'users',
    data: {
      email: 'dev@payloadcms.com',
      password: 'test',
    }
  })

  /************************************
    Media
   ************************************/
  logger.info(`Starting media upload: ${MEDIA_ITEMS_AMOUNT} items with concurrency of ${MEDIA_CONCURRENCY}`);

  const mediaLimiter = pLimit(MEDIA_CONCURRENCY);
  const mediaPromises = [];
  const mediaItems: Media[] = [];

  for (let i = 0; i < MEDIA_ITEMS_AMOUNT; i++) {
    const index = i;
    mediaPromises.push(
      mediaLimiter(async () => {
        try {
          // Generate a proper filename with extension
          const imageFilename = `image-${index}-${Date.now()}.jpg`;
          const localFilePath = path.resolve(dirname, imageFilename);

          // Fetch image from picsum
          const randomImageUrl = `https://picsum.photos/500/500?random=${Math.random()}`;
          const imageBuffer = await fetchImageBuffer(randomImageUrl);
          if (!imageBuffer) {
            logger.warn(`Failed to fetch image for index ${index}`);
            return null;
          }

          // Write to disk
          fs.writeFileSync(localFilePath, imageBuffer);

          // Upload to Payload with explicit filename
          const uploadedMediaItem = await payload.create({
            collection: 'media',
            data: {
              alt: faker.lorem.words(3),
              // Some Payload CMS implementations require filename in the data
              filename: imageFilename
            },
            filePath: localFilePath,
            // Pass file data explicitly
            file: {
              data: imageBuffer,
              size: imageBuffer.length,
              name: imageFilename,
              mimetype: 'image/jpeg'
            }
          });

          logger.info(`✅ Created Media Item ID: ${uploadedMediaItem.id}. Remaining: ${MEDIA_ITEMS_AMOUNT - index - 1}`);

          // Clean up local file
          if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
          }

          return uploadedMediaItem;
        } catch (error) {
          logger.error(`Error uploading media item for index ${index}:`, error);
          // Clean up local file in case of error
          const localFilePath = path.resolve(dirname, `image-${index}-${Date.now()}.jpg`);
          if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
          }
          return null;
        }
      })
    );

    // Process in smaller batches to avoid overwhelming the system
    if (mediaPromises.length >= MEDIA_CONCURRENCY * 5 || i === MEDIA_ITEMS_AMOUNT - 1) {
      const results = await Promise.all(mediaPromises);
      const validResults = results.filter(Boolean);
      // @ts-expect-error
      mediaItems.push(...validResults);
      mediaPromises.length = 0;
      logger.info(`Batch complete. Total media items processed: ${mediaItems.length}`);

      // Add a small delay between batches to prevent system overload
      if (i < MEDIA_ITEMS_AMOUNT - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Process any remaining media promises
  if (mediaPromises.length > 0) {
    const results = await Promise.all(mediaPromises);
    const validResults = results.filter(Boolean);
    // @ts-expect-error
    mediaItems.push(...validResults);
    logger.info(`Final media batch complete. Total media items: ${mediaItems.length}`);
  }

  logger.info(`✅ Media upload complete. Successfully uploaded ${mediaItems.length} items.`);

  // Early exit if no media was created
  if (mediaItems.length === 0) {
    logger.error('No media items were created. Cannot proceed with creating centres.');
    return;
  }

  /************************************
    Centres
   ************************************/
  logger.info(`Starting centres creation: ${CENTRES_AMOUNT} items with concurrency of ${CENTRES_CONCURRENCY}`);

  const centresLimiter = pLimit(CENTRES_CONCURRENCY);
  const centresPromises = [];
  let successfulCentres = 0;

  for (let i = 0; i < CENTRES_AMOUNT; i++) {
    const index = i;
    centresPromises.push(
      centresLimiter(async () => {
        try {
          // Safely get random media IDs, handling the case where mediaItems might be empty
          const getRandomMediaId = () => {
            if (mediaItems.length === 0) return undefined;
            const randomItem = mediaItems[Math.floor(Math.random() * mediaItems.length)];
            return randomItem?.id;
          };

          const centre = await payload.create({
            collection: 'centres',
            data: {
              name: faker.company.name(),
              featuredImage: getRandomMediaId(),
              logo: getRandomMediaId(),
              // @ts-expect-error
              images: Array(3).fill(null).map(() => getRandomMediaId()).filter(Boolean),
            }
          });

          successfulCentres++;
          logger.info(`✅ Created Centre Item ID: ${centre.id}. Remaining: ${CENTRES_AMOUNT - index - 1}`);
          return centre;
        } catch (error) {
          logger.error(`Error creating centre for index ${index}:`, error);
          return null;
        }
      })
    );

    // Process in smaller batches
    if (centresPromises.length >= CENTRES_CONCURRENCY * 5 || i === CENTRES_AMOUNT - 1) {
      await Promise.all(centresPromises);
      centresPromises.length = 0;
      logger.info(`Batch of centres complete. Total successful: ${successfulCentres}`);

      // Small delay between batches
      if (i < CENTRES_AMOUNT - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  // Process any remaining centres promises
  if (centresPromises.length > 0) {
    await Promise.all(centresPromises);
    logger.info(`Final centres batch complete. Total successful: ${successfulCentres}`);
  }

  logger.info(`✅ Successfully seeded all data. Created ${mediaItems.length} media items and ${successfulCentres} centres.`);
};

const fetchImageBuffer = async (url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

await seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
