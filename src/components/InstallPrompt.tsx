import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './InstallPrompt.css';

// Extend the window interface to include the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Listen for the event that the browser fires when the PWA is installable
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI to notify the user they can add to home screen
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
            console.log('PWA was installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setIsInstallable(false); // Hide the banner if accepted
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsDismissed(true);
    };

    // Don't render if it's not installable, or if the user dismissed it
    if (!isInstallable || isDismissed) return null;

    return (
        <div className="install-prompt-banner">
            <div className="install-prompt-content">
                <div className="install-icon-wrapper">
                    <Download size={20} />
                </div>
                <div className="install-text">
                    <h4>Install SafeHands App</h4>
                    <p>Add to your home screen for quick access and offline support.</p>
                </div>
            </div>
            <div className="install-actions">
                <button className="install-btn-dismiss" onClick={handleDismiss}>
                    Not Now
                </button>
                <button className="install-btn-primary" onClick={handleInstallClick}>
                    Install
                </button>
                <button className="install-btn-close" onClick={handleDismiss} title="Close">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
