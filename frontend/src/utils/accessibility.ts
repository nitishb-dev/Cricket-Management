export const handleKeyDown = (
    event: React.KeyboardEvent,
    callback: () => void,
    keys = ['Enter', ' ']
) => {
    if (keys.includes(event.key)) {
        event.preventDefault();
        callback();
    }
};

export const a11yProps = (label: string, role?: string) => ({
    'aria-label': label,
    role,
});

export const focusTrap = (element: HTMLElement | null) => {
    if (!element) return;
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    };

    element.addEventListener('keydown', handleTab);
    return () => element.removeEventListener('keydown', handleTab);
};
