import firebase from 'firebase';
import { SecondaryContentBlock } from '../models/SecondaryContentBlock';
import { PrimaryContentBlock, PrimaryContentDungeonLevelData } from '../models/PrimaryContentBlock';
import secondaryContentList from '../../assets/secondaryContentBlocks/index.json';
import { getCachedUserData } from './userHelpers';
import globalState from '../worldstate/index';
import { ContentPackage } from '../models/ContentPackage';

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
	const contentPackages: ContentPackage[] = [];
	const db = firebase.firestore().collection('contentPackages');
	return db
		.where('published', '==', true)
		.get()
		.then((queryResult) => {
			queryResult.docs.forEach((doc) => {
				contentPackages.push({ id: doc.id, ...doc.data() } as ContentPackage);
			});
			contentDataLibrary.contentPackages = contentPackages;
		});
};

export const loadContentBlocksFromDatabase = () => {
	const primaryContentBlocks: PrimaryContentBlock[] = [];
	const db = firebase.firestore().collection('primaryContentBlocks');
	const promises: Promise<any>[] = [];
	for (const contentPackage of globalState.contentPackages) {
		promises.push(
			db
				.where('contentPackage', '==', contentPackage)
				.get()
				.then((queryResult) => {
					queryResult.docs.forEach((doc) => {
						primaryContentBlocks.push(doc.data() as PrimaryContentBlock);
					});
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

for (const secondaryContentName of secondaryContentList) {
	try {
		// We "require" json files to allow for non-static, primary content block based lookup
		// Note: Using variables for the path results in an error!
		// tslint:disable: no-var-requires
		const secondaryContentObject: SecondaryContentBlock = require(`../../${SECONDARY_CONTENT_BLOCK_PATH}/${secondaryContentName}.json`);
		// tslint:enable

		contentDataLibrary.secondaryContent.push(secondaryContentObject);
	} catch (e) {
		console.error(
			`Secondary content block json file not found in path: ` +
				`../../${SECONDARY_CONTENT_BLOCK_PATH}/${secondaryContentName}.json`
		);
	}
}

export default contentDataLibrary;
