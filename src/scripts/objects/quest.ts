import { QuestTheme } from "../models/StoryLineData";

export abstract class Quest {
    title: string;
    description: string;
    task: string; // SHOULD BE A TASK CLASS
    enemyType: string;
    rooms: string[];

    constructor(title: string, description: string, task: string, enemyType: string, rooms: string[]) {
        this.title = title;
        this.description = description;
        this.task = task;
        this.enemyType = enemyType;
        this.rooms = rooms;
    }
}

export class MainQuest extends Quest {
    constructor(title: string, description: string, task: string, enemyType: string, rooms: string[]) {
        super(title, description, task, enemyType, rooms);
    }
}

export class VariableMainQuest extends Quest {
    theme: QuestTheme;

    constructor(title: string, description: string, task: string, enemyType:  string, rooms: string[], theme: QuestTheme) {
        super(title, description, task, enemyType, rooms);
        this.theme = theme;
    }
}

export class SideQuest extends Quest {
    theme: QuestTheme;
    level?: number;

    constructor(title: string, description: string, task: string, enemyType:  string, rooms: string[], theme: QuestTheme) {
        super(title, description, task, enemyType, rooms);
        this.theme = theme;
    }
}

