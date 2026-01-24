import { GovernanceTopic } from '../../types/schemas/governance-schema';

const TOPIC_DURATIONS: Record<GovernanceTopic, number> = {
    standard: 30,
    strategic: 60,
};

/**
 * Calculates the required slot duration in minutes based on the topic type.
 * @param topic The governance topic type
 * @returns The duration in minutes
 */
export function calculateSlotDuration(topic: GovernanceTopic): number {
    return TOPIC_DURATIONS[topic];
}
