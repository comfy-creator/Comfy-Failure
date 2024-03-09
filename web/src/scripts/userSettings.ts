import { $el } from './utils.ts';
import { IComfyUserSettings } from '../types/interfaces.ts';
import { api } from './api.tsx';
import { v4 as uuidv4 } from 'uuid';

export class ComfyUserSettings implements IComfyUserSettings {
    private static instance: ComfyUserSettings;

    isNewUserSession: boolean | null;
    storageLocation: string | null;
    multiUserServer: boolean | null;

    private constructor() {
        this.storageLocation = null;
        this.multiUserServer = null;
        this.isNewUserSession = null;
    }

    static getInstance() {
        if (!ComfyUserSettings.instance) {
            ComfyUserSettings.instance = new ComfyUserSettings();
        }

        return ComfyUserSettings.instance;
    }

    async #migrateSettings() {
        this.isNewUserSession = true;

        // Store all current settings
        const settings = Object.keys(this.ui.settings).reduce((p: { [x: string]: any }, n) => {
            const v = localStorage[`Comfy.Settings.${n}`];
            if (v) {
                try {
                    p[n] = JSON.parse(v);
                } catch (error) {
                    console.error(error);
                }
            }
            return p;
        }, {});

        await api.storeSettings(settings);
    }

    async setUser(settings?: { [x: string]: any }) {
        const userConfig = await api.getUserConfig();
        this.storageLocation = userConfig.storage;
        if (typeof userConfig.migrated == 'boolean') {
            // Single user mode migrated true/false for if the default user is created
            if (!userConfig.migrated && this.storageLocation === 'server') {
                // Default user not created yet
                await this.#migrateSettings();
            }
            return;
        }
        this.multiUserServer = true;
        let user = localStorage['Comfy.userId'];
        const users = userConfig.users ?? {};
        if (!user || !users[user]) {
            user = uuidv4();

            localStorage['Comfy.userName'] = user;
            localStorage['Comfy.userId'] = user;

            api.user = user;
            await this.#migrateSettings();
        }

        api.user = user;
        this.ui.settings.addSetting({
            id: 'Comfy.SwitchUser',
            name: 'Switch User',
            defaultValue: 'any',
            type: (name: string) => {
                let currentUser = localStorage['Comfy.userName'];
                if (currentUser) {
                    currentUser = ` (${currentUser})`;
                }
                return $el('tr', [
                    $el('td', [
                        $el('label', {
                            textContent: name,
                        }),
                    ]),
                    $el('td', [
                        $el('button', {
                            textContent: name + (currentUser ?? ''),
                            onclick: () => {
                                delete localStorage['Comfy.userId'];
                                delete localStorage['Comfy.userName'];
                                window.location.reload();
                            },
                        }),
                    ]),
                ]);
            },
        });
    }
}

export const userSettings = ComfyUserSettings.getInstance();
