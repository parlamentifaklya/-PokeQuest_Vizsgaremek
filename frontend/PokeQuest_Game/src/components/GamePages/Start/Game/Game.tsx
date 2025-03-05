import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import styles from './Game.module.css';
import { GetAllFeylings } from '../../../../services/ApiServices';
import { Feyling } from '../../../../types/Feyling';

interface GameProps {
  selectedFeyling?: Feyling;
}

const Game: React.FC<GameProps> = ({ selectedFeyling }) => {
  const gameRef = useRef<HTMLDivElement | null>(null);
  const [turn, setTurn] = useState<'Player' | 'Enemy'>('Player');
  const [playerHP, setPlayerHP] = useState<number>(selectedFeyling?.hp || 100);
  const [enemyHP, setEnemyHP] = useState<number>(100);
  const [enemyFeyling, setEnemyFeyling] = useState<Feyling | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeylings = async () => {
      try {
        const data = await GetAllFeylings();
        if (data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setEnemyFeyling(data[randomIndex]);
        }
      } catch (error) {
        console.error('Failed to fetch Feylings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeylings();
  }, []);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
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

    function preload(this: Phaser.Scene) {
      this.load.image('background', '/bg.png'); // Load the background image from public folder
      if (selectedFeyling) {
        this.load.image('player', selectedFeyling.img); // Load player Feyling image
      }
      if (enemyFeyling) {
        this.load.image('enemy', enemyFeyling.img); // Load enemy Feyling image
      }
    }

    function create(this: Phaser.Scene) {
      this.add.image(500, 300, 'background').setDisplaySize(1000, 600); // Background centered

      // Display player's Feyling at a position on the game screen
      if (selectedFeyling) {
        this.add.image(200, 400, 'player').setScale(0.2); // Scale the player image appropriately
        this.add.text(180, 420, selectedFeyling.name, { fontSize: '16px', color: '#fff' });
      }

      // Display enemy's Feyling at a different position on the game screen
      if (enemyFeyling) {
        this.add.image(800, 400, 'enemy').setScale(0.2); // Scale the enemy image appropriately
        this.add.text(780, 420, enemyFeyling.name, { fontSize: '16px', color: '#fff' });
      }

      // Add Attack button (clickable text)
      this.add
        .text(450, 550, 'Attack', { fontSize: '32px', color: '#fff' })
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
  }, [turn, enemyHP, playerHP, selectedFeyling, enemyFeyling]);

  if (loading) {
    return <p>Loading Feylings...</p>;
  }

  return <div className={styles.gameWrapper} ref={gameRef}></div>;
};

export default Game;
