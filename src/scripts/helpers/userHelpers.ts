import firebase from 'firebase';
import { UserInformation } from './UserInformation';

let cachedUserData: UserInformation | undefined;

export const getCachedUserData: () => UserInformation | undefined = () => {
	return cachedUserData;
};

export const loadUserData: (userId: string) => Promise<UserInformation | undefined> = async (
	userId: string
) => {
	const userDocRef = firebase.firestore().collection('users').doc(userId);
	const userDoc = await userDocRef.get();
	if (userDoc.exists) {
		cachedUserData = userDoc.data() as UserInformation;
	} else {
		cachedUserData = undefined;
	}
	return cachedUserData;
};
