import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import styles from './Game.module.css';
import { GetAllFeylings } from '../../../../services/ApiServices';
import { Feyling } from '../../../../types/Feyling';

const Game = ({ selectedFeyling }) => {
    const gameRef = useRef(null);
    const [turn, setTurn] = useState('Player');
    const [playerHP, setPlayerHP] = useState(selectedFeyling?.hp || 100);
    const [enemyHP, setEnemyHP] = useState(100);
    const [enemyFeyling, setEnemyFeyling] = useState<Feyling | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeylings = async () => {
            try {
                const data = await GetAllFeylings();
                if (data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * data.length);
                    setEnemyFeyling(data[randomIndex]);
                }
            } catch (error) {
                console.error("Failed to fetch Feylings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeylings();
    }, []);

    useEffect(() => {
        if (!gameRef.current) return;

        const config = {
            type: Phaser.AUTO,
            width: 1000,
            height: 600,
            parent: gameRef.current,
            scene: {
                preload: preload,
                create: create,
            },
        };

        const game = new Phaser.Game(config);

        function preload() {
            this.load.image('background', 'https://placehold.co/1000x600');  // ✅ Placeholder Image
        }

        function create() {
            this.add.image(500, 300, 'background').setDisplaySize(1000, 600);  // ✅ Centered
            this.add.text(450, 550, 'Attack', { fontSize: '32px', fill: '#fff' })
                .setInteractive()
                .on('pointerdown', handleAttack);
        }

        function handleAttack() {
            if (turn === 'Player') {
                const damage = Math.floor(Math.random() * 20) + 5;
                setEnemyHP((prev) => Math.max(prev - damage, 0));
                setTurn('Enemy');
                setTimeout(enemyTurn, 1000);
            }
        }

        function enemyTurn() {
            if (enemyHP > 0) {
                const damage = Math.floor(Math.random() * 20) + 5;
                setPlayerHP((prev) => Math.max(prev - damage, 0));
                setTurn('Player');
            }
        }

        return () => {
            game.destroy(true);
        };
    }, [turn, enemyHP, playerHP]);

    if (loading) {
        return <p>Loading Feylings...</p>;
    }

    return (
        <div className={styles.gameWrapper} ref={gameRef}>
            {/* Player Feyling */}
            <div className={styles.feylingContainer}>
                {selectedFeyling && (
                    <div className={styles.playerFeyling}>
                        <img src={selectedFeyling.feylingImg} alt={selectedFeyling.name} />
                        <p>{selectedFeyling.name}</p>
                        <p>HP: {playerHP}</p>
                        <p>ATK: {selectedFeyling.atk}</p>
                    </div>
                )}
            </div>

            {/* Game window and Enemy Feyling */}
            <div className={styles.enemyContainer} >
                <div className={styles.gameContainer} ></div>
                {enemyFeyling && (
                    <div className={styles.enemyFeyling}>
                        <img src={enemyFeyling.img} alt={enemyFeyling.name} />
                        <p>{enemyFeyling.name}</p>
                        <p>HP: {enemyHP}</p>
                        <p>ATK: {enemyFeyling.atk}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Game;
