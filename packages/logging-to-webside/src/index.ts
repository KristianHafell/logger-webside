
export const triggerAddLog = (log: any) => {
    const addLogEvent = new CustomEvent('addLog', { detail: log });
    window.dispatchEvent(addLogEvent); // Dispatch addLog event to trigger the addLog function in the Vue component
};