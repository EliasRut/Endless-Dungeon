import { SecondaryContentBlock } from '../models/SecondaryContentBlock';
import { PrimaryContentBlock, PrimaryContentDungeonLevelData } from '../models/PrimaryContentBlock';

import primaryContentBlockList from '../../assets/primaryContentBlocks/index.json';
import secondaryContentList from '../../assets/secondaryContentBlocks/index.json';
import { RuneAssignment } from './constants';
import { DungeonRunData } from '../models/DungeonRunData';

const PRIMARY_CONTENT_BLOCK_PATH = 'assets/primaryContentBlocks';
const SECONDARY_CONTENT_BLOCK_PATH = 'assets/secondaryContentBlocks';

export interface ContentDataLibrary {
	primaryContent: PrimaryContentBlock[];
	secondaryContent: SecondaryContentBlock[];
}

const contentDataLibrary: ContentDataLibrary = {
	primaryContent: [],
	secondaryContent: []
};

for (const secondaryContentName of secondaryContentList) {
	try {
	// We "require" json files to allow for non-static, primary content block based lookup
	// Note: Using variables for the path results in an error!
	// tslint:disable: no-var-requires
	const secondaryContentObject: SecondaryContentBlock =
		require(`../../${SECONDARY_CONTENT_BLOCK_PATH}/${secondaryContentName}.json`);
	// tslint:enable

	contentDataLibrary.secondaryContent.push(secondaryContentObject);
	} catch(e) {
		console.error(`Secondary content block json file not found in path: ` +
			`../../${SECONDARY_CONTENT_BLOCK_PATH}/${secondaryContentName}.json`);
	}
}

for (const primaryContentName of primaryContentBlockList) {
	try {
	// We "require" json files to allow for non-static, story line based lookup
	// Note: Using variables for the path results in an error!
	// tslint:disable-next-line: no-var-requires

	// tslint:disable: no-var-requires
	const primaryContentObject: PrimaryContentBlock =
		require(`../../${PRIMARY_CONTENT_BLOCK_PATH}/${primaryContentName}.json`);
	// tslint:enable

	contentDataLibrary.primaryContent.push(primaryContentObject);
	} catch(e) {
		console.error(`Primary content json file not found in path: ` +
			`../../${PRIMARY_CONTENT_BLOCK_PATH}/${primaryContentName}.json`);
	}
}

export default contentDataLibrary;