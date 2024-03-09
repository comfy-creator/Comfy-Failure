import { IComfyPlugin } from '../../types/interfaces';

interface IAddSetting {
    type: any;
    id: string;
    name: string;
    attrs?: Object;
    tooltip?: string;
    defaultValue?: any;
    onChange?: (...arg: any[]) => any;
    options?: ComboOption[] | ((value: string) => (ComboOption | string)[]);
}

const id = 'core:DOMClippingEnabled';

export const DomClippingPlugin: IComfyPlugin<void> = {
    id,
    autoStart: true,
    activate: async app => {
        app.ui.settings.addSetting({
            id,
            name: 'Enable DOM element clipping (enabling may reduce performance)',
            type: 'boolean',
            defaultValue: true,
        });

        // app.comfyNode.
    },
    deactivate: async app => {
        app.ui.settings.removeSetting(id);
    },
};

if (app.ui.settings.getSettingValue('Comfy.DOMClippingEnabled', true)) {
    element.style.clipPath = getClipPath(node, element, elRect);
    element.style.willChange = 'clip-path';
}
