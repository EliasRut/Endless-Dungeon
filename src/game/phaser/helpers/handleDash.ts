import { AbilityData } from '../../../types/AbilityData';
import Character from '../../../types/Character';
import MainScene from '../scenes/MainScene';
import { SCALE } from './constants';
import { getVelocitiesForFacing } from './movement';
import { getAbsoluteDistancesToWorldStatePosition, getClosestTarget } from './targetingHelpers';

export const handleDash = (scene: MainScene, caster: Character, abilityData: AbilityData) => {
	const casterToken = scene.getTokenForStateObject(caster);
	if (casterToken) {
		const rotationFactors = getVelocitiesForFacing(caster.currentFacing);
		const velocity = casterToken.body!.velocity;
		const dashVelocityX = abilityData.dashSpeed! * SCALE * rotationFactors.x;
		const dashVelocityY = abilityData.dashSpeed! * SCALE * rotationFactors.y;
		casterToken.setVelocity(dashVelocityX, dashVelocityY);
		if (abilityData.dashInvulnerability) {
			casterToken.body!.checkCollision.none = true;
			caster.dashing = true;
			casterToken.alpha = 0.2;
		}

		let maximumDashDuration = Infinity;

		if (abilityData.stopDashBeforeEnemyCollision) {
			const closestTarget = getClosestTarget(
				casterToken.faction!,
				casterToken.x,
				casterToken.y,
				caster.currentFacing
			);

			if (closestTarget) {
				const distances = getAbsoluteDistancesToWorldStatePosition(
					casterToken.x,
					casterToken.y,
					closestTarget.x,
					closestTarget.y
				);
				maximumDashDuration =
					Math.min(
						dashVelocityX
							? Math.max(0, distances[0] - 16 * SCALE) / Math.abs(dashVelocityX)
							: Infinity,
						dashVelocityY
							? Math.max(0, distances[1] - 16 * SCALE) / Math.abs(dashVelocityY)
							: Infinity
					) * 1000;
			}
		}

		setTimeout(() => {
			casterToken.setVelocity(velocity.x, velocity.y);
			caster.dashing = false;
			casterToken.body!.checkCollision.none = false;
			casterToken.alpha = 1;
		}, Math.min(maximumDashDuration, abilityData.dashDuration!));
	}
};
