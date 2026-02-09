import { useState, useEffect, useRef, useCallback } from 'react';

export const useTelemetry = () => {
    const [telemetry, setTelemetry] = useState({
        tabSwitches: 0,
        mouseDistance: 0,
        rageClicks: 0,
        idleTime: 0,
    });

    const lastMousePos = useRef({ x: 0, y: 0 });
    const lastClickTime = useRef(0);
    const clickCount = useRef(0);
    const idleTimer = useRef(null);

    // Track Tab Visibility (Distraction)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTelemetry(prev => ({ ...prev, tabSwitches: prev.tabSwitches + 1 }));
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    // Track Mouse Movement (Agitation/Engagement)
    useEffect(() => {
        const handleMouseMove = (e) => {
            const dist = Math.hypot(e.clientX - lastMousePos.current.x, e.clientY - lastMousePos.current.y);
            lastMousePos.current = { x: e.clientX, y: e.clientY };

            setTelemetry(prev => ({ ...prev, mouseDistance: prev.mouseDistance + dist }));

            // Reset idle timer
            if (idleTimer.current) clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => {
                setTelemetry(prev => ({ ...prev, idleTime: prev.idleTime + 1 }));
            }, 1000); // Increment idle seconds every second of no movement? 
            // Actually simpler: just track last interaction time.
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Track Rage Clicks (Frustration)
    useEffect(() => {
        const handleClick = () => {
            const now = Date.now();
            if (now - lastClickTime.current < 300) {
                clickCount.current += 1;
            } else {
                clickCount.current = 1;
            }
            lastClickTime.current = now;

            if (clickCount.current > 3) {
                setTelemetry(prev => ({ ...prev, rageClicks: prev.rageClicks + 1 }));
                clickCount.current = 0; // Reset after detecting rage
            }
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    const resetTelemetry = useCallback(() => {
        setTelemetry({
            tabSwitches: 0,
            mouseDistance: 0,
            rageClicks: 0,
            idleTime: 0
        });
    }, []);

    return { telemetry, resetTelemetry };
};
