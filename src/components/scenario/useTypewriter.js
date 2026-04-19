import { useEffect, useState } from 'react';

export default function useTypewriter(text, speed = 30) {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (!text) {
            setDisplayedText('');
            return undefined;
        }

        setDisplayedText('');
        let index = 0;

        const timer = setInterval(() => {
            setDisplayedText((previous) => previous + text.charAt(index));
            index += 1;

            if (index >= text.length) {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed]);

    return displayedText;
}