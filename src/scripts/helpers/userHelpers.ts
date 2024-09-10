import { UserInformation } from './UserInformation';
import { collection, doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../shared/initializeApp';

let cachedUserData: UserInformation | undefined;

export const getCachedUserData: () => UserInformation | undefined = () => {
	return cachedUserData;
};

export const loadUserData: (userId: string) => Promise<UserInformation | undefined> = async (
	userId: string
) => {
	const db = getFirestore(app);
	const usersCollection = collection(db, 'users');

	const userDocRef = doc(usersCollection, userId);
	const userDoc = await getDoc(userDocRef);
	if (userDoc.exists()) {
		cachedUserData = userDoc.data() as UserInformation;
	} else {
		cachedUserData = undefined;
	}
	return cachedUserData;
};
