import 'phaser';
import React, { useEffect, useRef, useState } from 'react';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode, MinMaxParticleEffectValue } from '../../scripts/helpers/constants';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import firebase from 'firebase';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import '../App.css';
import { UserInformation } from '../../scripts/helpers/UserInformation';
import AbilityEditor, {
	DefaultAbilityData,
	EditedAbilityData,
} from '../../scripts/scenes/AbilityEditor';
import { EmitterInputBlock } from '../components/EmitterInputBlock';
import { EmitterTintInputBlock } from '../components/EmitterTintInputBlock';

const showGame = true;

export interface AbilityEditorScreenProps {
	user: UserInformation;
}

const abilityData: EditedAbilityData = { ...DefaultAbilityData };

const getData = () => abilityData;

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
	width: 336px;
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
