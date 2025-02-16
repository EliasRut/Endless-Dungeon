import { SecondaryContentBlock } from '../../../types/SecondaryContentBlock';
import { PrimaryContentBlock } from '../../../types/PrimaryContentBlock';
import worldstate from '../worldState';
import { ContentPackage } from '../../../types/ContentPackage';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from './initializeApp';
import { getBaseUrl } from './getBaseUrl';

const PRIMARY_CONTENT_BLOCK_PATH = 'assets/primaryContentBlocks';
const SECONDARY_CONTENT_BLOCK_PATH = 'assets/secondaryContentBlocks';

export interface ContentDataLibrary {
	contentPackages: ContentPackage[];
	primaryContent: PrimaryContentBlock[];
	secondaryContent: SecondaryContentBlock[];
}

const contentDataLibrary: ContentDataLibrary = {
	contentPackages: [],
	primaryContent: [],
	secondaryContent: [],
};

export const loadContentPackagesFromDatabase = () => {
	const db = getFirestore(app);
	const contentPackagesCollection = collection(db, 'contentPackages');
	const contentPackages: ContentPackage[] = [];

	return getDocs(query(contentPackagesCollection, where('published', '==', true))).then(
		(queryResult) => {
			queryResult.docs.forEach((doc) => {
				contentPackages.push({ id: doc.id, ...doc.data() } as ContentPackage);
			});
			contentDataLibrary.contentPackages = contentPackages;
		}
	);
};

export const loadContentBlocksFromDatabase = async () => {
	const primaryContentBlocks: PrimaryContentBlock[] = [];
	const db = getFirestore(app);
	const primaryContentBlocksCollection = collection(db, 'primaryContentBlocks');
	const promises: Promise<any>[] = [];
	for (const contentPackage of worldstate.contentPackages) {
		promises.push(
			getDocs(
				query(primaryContentBlocksCollection, where('contentPackage', '==', contentPackage))
			).then((queryResult) => {
				queryResult.docs.forEach((doc) => {
					primaryContentBlocks.push(doc.data() as PrimaryContentBlock);
				});
			})
		);
	}

	// We will need to rewrite or remove this fetch based code
	const baseUrl = getBaseUrl();
	// Fetch the list of secondary content blocks
	const secondaryContentListPath = `${baseUrl}/assets/secondaryContentBlocks/index.json`;
	const secondaryContentList: string[] = [];
	await fetch(secondaryContentListPath)
		.then((response) => response.json())
		.then((data) => {
			secondaryContentList.push(...data);
		})
		.catch(() => {
			console.error(`Secondary content block list not found in path: ${secondaryContentListPath}`);
		});

	for (const secondaryContentName of secondaryContentList) {
		// Fetch the secondary content block
		promises.push(
			fetch(`${baseUrl}/${SECONDARY_CONTENT_BLOCK_PATH}/${secondaryContentName}.json`)
				.then((response) => response.json())
				.then((secondaryContentObject: SecondaryContentBlock) => {
					contentDataLibrary.secondaryContent.push(secondaryContentObject);
				})
				.catch(() => {
					console.error(
						`Secondary content block json file not found in path: ` +
							`${baseUrl}/${SECONDARY_CONTENT_BLOCK_PATH}/${secondaryContentName}.json`
					);
				})
		);
	}

	return Promise.all(promises).then(() => {
		contentDataLibrary.primaryContent = primaryContentBlocks;
	});
};

// for (const primaryContentName of primaryContentBlockList) {
// 	try {
// 	// We "require" json files to allow for non-static, story line based lookup
// 	// Note: Using variables for the path results in an error!
// 	// tslint:disable-next-line: no-var-requires

// 	// tslint:disable: no-var-requires
// 	const primaryContentObject: PrimaryContentBlock =
// 		require(`../../${PRIMARY_CONTENT_BLOCK_PATH}/${primaryContentName}.json`);
// 	// tslint:enable

// 	contentDataLibrary.primaryContent.push(primaryContentObject);
// 	} catch(e) {
// 		console.error(`Primary content json file not found in path: ` +
// 			`../../${PRIMARY_CONTENT_BLOCK_PATH}/${primaryContentName}.json`);
// 	}
// }

// for (const secondaryContentName of secondaryContentList) {
// 	try {
// 		// We "require" json files to allow for non-static, primary content block based lookup
// 		// Note: Using variables for the path results in an error!
// 		// tslint:disable: no-var-requires
// 		const secondaryContentObject: SecondaryContentBlock = require(`../../${SECONDARY_CONTENT_BLOCK_PATH}/${secondaryContentName}.json`);
// 		// tslint:enable

// 		contentDataLibrary.secondaryContent.push(secondaryContentObject);
// 	} catch (e) {
// 		console.error(
// 			`Secondary content block json file not found in path: ` +
// 				`../../${SECONDARY_CONTENT_BLOCK_PATH}/${secondaryContentName}.json`
// 		);
// 	}
// }

export default contentDataLibrary;
