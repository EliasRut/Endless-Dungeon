import 'phaser';
import { useEffect, useRef, useState } from 'react';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Dropdown } from '../components/Dropdown';
import { UserInformation } from '../../scripts/helpers/UserInformation';
import AbilityEditor, {
	DefaultAbilityData,
	EditedAbilityData,
} from '../../editors/scenes/AbilityEditor';
import { EmitterInputBlock } from '../components/EmitterInputBlock';
import { EmitterTintInputBlock } from '../components/EmitterTintInputBlock';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import '../App.css';
import { AbilityData } from '../../types/AbilityData';
import { ProjectileData, ProjectileParticleData } from '../../types/ProjectileData';
import { MinMaxParticleEffectValue } from '../../types/AbilityType';

const showGame = true;

export interface AbilityEditorScreenProps {
	user: UserInformation;
}

let abilityData: EditedAbilityData = { ...DefaultAbilityData };

const getData = () => abilityData;

const setAbilityDataFromDataObject = (data: AbilityData) => {
	abilityData.emitterAlpha = data.projectileData?.particleData?.alpha || 1;
	abilityData.emitterScale = data.projectileData?.particleData?.scale || 1;
	abilityData.emitterSpeed = data.projectileData?.particleData?.speed || 1;
	abilityData.emitterRotate = data.projectileData?.particleData?.rotate || 1;
	abilityData.emitterLifespan = data.projectileData?.particleData?.lifespan || 1;
	abilityData.emitterTint = data.projectileData?.particleData?.tint || {
		redMin: 1,
		greenMin: 1,
		blueMin: 1,
		redDiff: 1,
		greenDiff: 1,
		blueDiff: 1,
	};

	abilityData.emitterMaxParticles = data.projectileData?.particleData?.maxParticles || 0;
	abilityData.emitterFrequency = data.projectileData?.particleData?.frequency || 0;
	abilityData.emitterExplosionSpeed = data.projectileData?.explosionData?.speed || 0;
	abilityData.emitterExplosionLifespan = data.projectileData?.explosionData?.lifespan || 0;
	abilityData.emitterExplosionParticles = data.projectileData?.explosionData?.particles || 0;
	abilityData.projectileImage = data.projectileData?.projectileImage || 'fire';
	abilityData.particleImage = data.projectileData?.particleData?.particleImage || 'fire';
	abilityData.projectiles = data.projectiles || 0;
	abilityData.delay = data.projectileData?.delay || 0;
	abilityData.minSpread = data.projectileData?.spread ? data.projectileData?.spread[0] : 0;
	abilityData.maxSpread = data.projectileData?.spread ? data.projectileData?.spread[1] : 0;
	abilityData.velocity = data.projectileData?.velocity || 0;
	abilityData.drag = data.projectileData?.drag || 0;
};

export const AbilityEditorScreen = ({ user }: AbilityEditorScreenProps) => {
	const phaserRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveMode(MODE.ABILITY_EDITOR);
		const config = getGameConfig(phaserRef.current!, MODE.ABILITY_EDITOR);
		const game = new Phaser.Game(config);
		const callbackIntervalId = setInterval(() => {
			const abilityEditorScene = game.scene.getScene('AbilityEditor') as AbilityEditor | null;
			if (abilityEditorScene) {
				abilityEditorScene.registerReactBridge({
					getData,
				});
				clearInterval(callbackIntervalId);
			}
		}, 100);
	}, [showGame]);

	const [activeAbilityId, setActiveAbilityId] = useState<string | undefined>(undefined);
	const [abilityName, setAbilityName] = useState<string>('New Ability');
	const [projectiles, setProjectiles] = useState<number>(1);
	const [delay, setDelay] = useState<number>(0);
	const [minSpread, setMinSpread] = useState<string>('0');
	const [maxSpread, setMaxSpread] = useState<string>('0');
	const [velocity, setVelocity] = useState<number>(200);
	const [drag, setDrag] = useState<number>(0);
	const [projectileImage, setProjectileImage] = useState<string>('fire');
	const [particleImage, setParticleImage] = useState<string>('fire');
	const [maxParticles, setMaxParticles] = useState<number>(200);
	const [frequency, setFrequency] = useState<number>(2);
	const [storedAbilities, setStoredAbilities] = useState<[string, string][]>([]);

	const saveAbility = async (data: AbilityData, id: string | undefined) => {
		const db = getFirestore();
		const abilityCollection = collection(db, 'abilities');
		const abilityDocRef = doc(abilityCollection, id);

		await setDoc(abilityDocRef, data);
		const abilityId = abilityDocRef.id;
		setActiveAbilityId(abilityId);

		getDocs(abilityCollection).then((query) => {
			const abilities: [string, string][] = query.docs.map((doc) => [
				doc.id,
				doc.get('abilityName') as string,
			]);
			setStoredAbilities(abilities);
		});
	};

	const loadAbility = async (id: string) => {
		const db = getFirestore();
		const abilityCollection = collection(db, 'abilities');
		const abilityDocRef = doc(abilityCollection, id);
		const abilityDoc = await getDoc(abilityDocRef);
		const data = abilityDoc.data() as AbilityData;
		setAbilityName(data.abilityName);
		setProjectiles(data.projectiles || 0);
		setDelay(data.projectileData?.delay || 0);
		setMinSpread(`${data.projectileData?.spread ? data.projectileData?.spread[0] : 0}`);
		setMaxSpread(`${data.projectileData?.spread ? data.projectileData?.spread[1] : 0}`);
		setVelocity(data.projectileData?.velocity || 0);
		setDrag(data.projectileData?.drag || 0);
		setProjectileImage(data.projectileData?.projectileImage || 'fire');
		setParticleImage(data.projectileData?.particleData?.particleImage || 'fire');
		setMaxParticles(data.projectileData?.particleData?.maxParticles || 0);
		setFrequency(data.projectileData?.particleData?.frequency || 0);

		setAbilityDataFromDataObject(data);
	};

	const resetData = () => {
		setAbilityName('New Ability');
		setProjectiles(1);
		setDelay(0);
		setMinSpread(`0`);
		setMaxSpread(`0`);
		setVelocity(200);
		setDrag(0);
		setProjectileImage('fire');
		setParticleImage('fire');
		setMaxParticles(200);
		setFrequency(2);

		abilityData = { ...DefaultAbilityData };
	};

	useEffect(() => {
		const db = getFirestore();
		const abilityCollection = collection(db, 'abilities');
		getDocs(abilityCollection).then((query) => {
			const abilities: [string, string][] = query.docs.map((doc) => [
				doc.id,
				doc.get('abilityName') as string,
			]);
			setStoredAbilities(abilities);
		});
	}, [showGame]);

	return (
		<PageContainer>
			<NavigationWrapper>
				<StyledLink to="/mapEditor">Map Editor</StyledLink>
				<StyledLink to="/npcEditor">NPC Editor</StyledLink>
				<StyledLink to="/questEditor">Quest Editor</StyledLink>
				<StyledLink to="/abilityEditor">Ability Editor</StyledLink>
				<StyledLink to="/game">Game</StyledLink>
			</NavigationWrapper>
			<PageWrapper>
				<AbilityEditorWrapper>
					<SettingsColumn>
						<ColumnHeader>Ability Data</ColumnHeader>
						<Dropdown
							value={activeAbilityId}
							onChange={(e: any) => {
								if (e.target.value) {
									setActiveAbilityId(e.target.value);
									loadAbility(e.target.value);
								} else {
									setActiveAbilityId(undefined);
									resetData();
								}
							}}
						>
							<option key="empty_ability" value="">
								New Ability
							</option>
							{storedAbilities.map(([id, name]) => (
								<option key={id} value={id}>
									{name}
								</option>
							))}
						</Dropdown>
						Ability Name
						<input
							value={abilityName}
							onChange={(e) => {
								setAbilityName(e.target.value);
							}}
						/>
						<SaveButton
							onClick={() =>
								saveAbility(
									{
										abilityName,
										projectiles,
										projectileData: {
											delay,
											spread: [parseFloat(minSpread), parseFloat(maxSpread)],
											xOffset: 0,
											yOffset: 0,
											destroyOnEnemyContact: true,
											destroyOnWallContact: true,
											velocity,
											drag,
											projectileImage,
											particleData: {
												particleImage,
												maxParticles,
												frequency,
												alpha: abilityData.emitterAlpha,
												scale: abilityData.emitterScale,
												speed: abilityData.emitterSpeed,
												rotate: abilityData.emitterRotate,
												lifespan: abilityData.emitterLifespan,
												tint: abilityData.emitterTint,
											} as unknown as ProjectileParticleData, // forced conversion: missing data
										} as unknown as ProjectileData, // forced conversion: missing data
										flavorText: '',
										damageMultiplier: 1,
									} as unknown as AbilityData, // forced conversion: missing data
									activeAbilityId
								)
							}
						>
							Save
						</SaveButton>
					</SettingsColumn>
					<LeftColumn>
						<ColumnHeader>Projectile Data</ColumnHeader>
						Projectile Image
						<Dropdown
							value={projectileImage}
							onChange={(e: any) => {
								const newProjectileImage = e.target.value;
								abilityData.projectileImage = newProjectileImage;
								setProjectileImage(newProjectileImage);
							}}
						>
							<option value="empty-tile">None</option>
							<option value="fire">Fire</option>
							<option value="ice">Ice</option>
							<option value="snow">Snow</option>
							<option value="rock">Rock</option>
							<option value="skull">Skull</option>
						</Dropdown>
						<div>
							Projectiles
							<br />
							<input
								value={projectiles}
								onChange={(e) => {
									const newProjectiles = parseInt(e.target.value, 10);
									abilityData.projectiles = newProjectiles;
									setProjectiles(newProjectiles);
								}}
							/>
						</div>
						<div>
							Delay
							<br />
							<input
								value={delay}
								onChange={(e) => {
									const newDelay = parseInt(e.target.value, 10);
									abilityData.delay = newDelay;
									setDelay(newDelay);
								}}
							/>
						</div>
						<div>
							Spread from
							<br />
							<input
								value={minSpread}
								onChange={(e) => {
									setMinSpread(e.target.value);
									const newMinSpread = parseFloat(e.target.value);
									if (!isNaN(newMinSpread)) {
										abilityData.minSpread = newMinSpread;
									}
								}}
							/>
						</div>
						<div>
							Spread to
							<br />
							<input
								value={maxSpread}
								onChange={(e) => {
									setMaxSpread(e.target.value);
									const newMaxSpread = parseFloat(e.target.value);
									if (!isNaN(newMaxSpread)) {
										abilityData.maxSpread = newMaxSpread;
									}
								}}
							/>
						</div>
						<div>
							Velocity
							<br />
							<input
								value={velocity}
								onChange={(e) => {
									const newVelocity = parseInt(e.target.value, 10);
									abilityData.velocity = newVelocity;
									setVelocity(newVelocity);
								}}
							/>
						</div>
						<div>
							Drag
							<br />
							<input
								value={drag}
								onChange={(e) => {
									const newDrag = parseInt(e.target.value, 10);
									abilityData.drag = newDrag;
									setDrag(newDrag);
								}}
							/>
						</div>
					</LeftColumn>
					<RightColumn>
						<ColumnHeader>Particle Data</ColumnHeader>
						Particle Image
						<Dropdown
							value={particleImage}
							onChange={(e: any) => {
								const newParticleImage = e.target.value;
								abilityData.particleImage = newParticleImage;
								setParticleImage(newParticleImage);
							}}
						>
							<option value="empty-tile">None</option>
							<option value="fire">Fire</option>
							<option value="ice">Ice</option>
							<option value="snow">Snow</option>
							<option value="rock">Rock</option>
							<option value="skull">Skull</option>
						</Dropdown>
						<div>
							Max Particles
							<br />
							<input
								value={maxParticles}
								onChange={(e) => {
									const newMaxParticles = parseInt(e.target.value, 10);
									abilityData.emitterMaxParticles = newMaxParticles;
									setMaxParticles(newMaxParticles);
								}}
							/>
						</div>
						<div>
							Frequency
							<br />
							<input
								value={frequency}
								onChange={(e) => {
									const newFrequency = parseInt(e.target.value, 10);
									abilityData.emitterFrequency = newFrequency;
									setFrequency(newFrequency);
								}}
							/>
						</div>
						<EmitterInputBlock
							inputName="Alpha"
							onValidChange={(value) => {
								abilityData.emitterAlpha = value;
							}}
						/>
						<EmitterInputBlock
							inputName="Scale"
							onValidChange={(value) => {
								abilityData.emitterScale = value;
							}}
						/>
						<EmitterInputBlock
							inputName="Speed"
							initialValue={20}
							onValidChange={(value) => {
								abilityData.emitterSpeed = value;
							}}
						/>
						<EmitterInputBlock
							inputName="Rotate"
							initialValue={0}
							onValidChange={(value) => {
								abilityData.emitterRotate = value;
							}}
						/>
						<EmitterInputBlock
							inputName="Lifespan"
							initialValue={300}
							minMaxOnly={true}
							onValidChange={(value) => {
								abilityData.emitterLifespan = value as MinMaxParticleEffectValue;
							}}
						/>
						<EmitterTintInputBlock
							inputName="Tint"
							onValidChange={(value) => {
								abilityData.emitterTint = value;
							}}
						/>
						<EmitterInputBlock
							inputName="Explosion Speed"
							initialValue={70}
							onValidChange={(value) => {
								abilityData.emitterExplosionSpeed = value;
							}}
						/>
						<EmitterInputBlock
							inputName="Explosion Lifespan"
							initialValue={100}
							minMaxOnly={true}
							onValidChange={(value) => {
								abilityData.emitterExplosionLifespan = value as MinMaxParticleEffectValue;
							}}
						/>
					</RightColumn>
				</AbilityEditorWrapper>
				<GameWrapper ref={phaserRef}></GameWrapper>
			</PageWrapper>
		</PageContainer>
	);
};

const PageContainer = styled.div`
	height: 100%;
	width: 100%;
`;

const NavigationWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-content: center;
	padding: 24px 0;
`;

const StyledLink = styled(NavLink)`
	& {
		font-family: 'endlessDungeon';
		font-size: 2rem;
		padding: 6px 24px;
		cursor: pointer;
		text-decoration: none;
		color: black;
		background-color: #ffffff;
		border-style: solid;
		border-radius: 0.5rem;
		margin: 0 24px;
	}
	&.active {
		background-color: #a09f9f;
	}
`;

const PageWrapper = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: row;
`;

const GameWrapper = styled.div`
	flex-grow: 1;
`;

const AbilityEditorWrapper = styled.div`
	width: 408px;
	color: white;
	padding: 16px;
	display: flex;
	flex-direction: row;
	gap: 8px;

	& input {
		width: 96px;
		box-sizing: border-box;
	}
`;

const SettingsColumn = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	width: 96px;
`;

const LeftColumn = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	width: 96px;
`;

const RightColumn = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	width: 96px;
`;

const ColumnHeader = styled.div`
	font-weight: bold;
`;

const SaveButton = styled.button`
	margin-top: 16px;
	width: 96px;
	padding: 4px 0;
`;
