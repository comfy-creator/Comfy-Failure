import React, { useEffect, useRef } from 'react';
import { usePrompt } from '../../hooks/usePrompt.tsx';

interface SaveButtonProps {
    promptFilename: {
        value: boolean;
    };
}

export function SaveButton({ promptFilename }: SaveButtonProps) {
    const { graphToPrompt } = usePrompt();
    const download = useRef<HTMLAnchorElement>(document.createElement('a'));

    return (
        <button
            id="comfy-save-button"
            onClick={() => {
                let filename: string | null = 'workflow.json';
                if (promptFilename.value) {
                    filename = prompt('Save workflow as:', filename);
                    if (!filename) return;
                    if (!filename.toLowerCase().endsWith('.json')) {
                        filename += '.json';
                    }
                }

                graphToPrompt().then((p: any) => {
                    const json = JSON.stringify(p.workflow, null, 2); // convert the data to a JSON string
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);

                    download.current.href = url;
                    download.current.download = filename!;
                    download.current.style.display = 'none';

                    download.current.click();

                    setTimeout(function () {
                        download.current.remove();
                        window.URL.revokeObjectURL(url);
                    }, 0);
                });
            }}
        >
            Save
        </button>
    );
}
