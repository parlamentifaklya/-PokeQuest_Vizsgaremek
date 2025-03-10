import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useFeyling } from '../../../../context/FeylingContext'; // Import context
import styles from './Game.module.css';
import { GetAllFeylings } from '../../../../services/ApiServices';
import { Feyling } from '../../../../types/Feyling';

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement | null>(null);
  const { selectedFeyling } = useFeyling(); // Get selected feyling from context
  const [turn, setTurn] = useState<'Player' | 'Enemy'>('Player');
  const [playerHP, setPlayerHP] = useState<number>(selectedFeyling?.feylingHp || 100);
  const [enemyHP, setEnemyHP] = useState<number>(100); // Set the initial enemy HP to the fetched enemy's HP
  const [enemyFeyling, setEnemyFeyling] = useState<Feyling | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const BASE_URL = 'http://localhost:5130/api/';

  useEffect(() => {
    const fetchFeylings = async () => {
      try {
        const data = await GetAllFeylings();
        if (data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setEnemyFeyling(data[randomIndex]);
          setEnemyHP(data[randomIndex].hp); // Set the enemy HP dynamically based on the fetched data
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
        update: update,
      },
    };

    const game = new Phaser.Game(config);

    let playerSprite: Phaser.GameObjects.Image;
    let enemySprite: Phaser.GameObjects.Image;
    let attackText: Phaser.GameObjects.Text;
    let playerHealthText: Phaser.GameObjects.Text;
    let enemyHealthText: Phaser.GameObjects.Text;

    function preload(this: Phaser.Scene) {
      this.load.image('background', 'bg.png'); // Load bg image from public folder
      // Load player and enemy images for Phaser sprites
      this.load.image('player', BASE_URL + selectedFeyling?.feylingImg); // Player image
      this.load.image('enemy', enemyFeyling?.img || 'defaultEnemyImg.png'); // Default image if enemy not loaded
    }

    function create(this: Phaser.Scene) {
      // Background
      this.add.image(500, 300, 'background').setDisplaySize(1000, 600);

      // Create player sprite and set its position
      playerSprite = this.add.image(200, 300, 'player');
      playerSprite.setScale(0.2); // Resize player image as necessary

      // Create enemy sprite and set its position
      enemySprite = this.add.image(800, 300, 'enemy');
      enemySprite.setScale(0.2); // Resize enemy image as necessary

      // Text for attack button (displayed on the screen)
      attackText = this.add
        .text(450, 550, 'Attack', { fontSize: '32px', color: '#fff' })
        .setInteractive()
        .on('pointerdown', handleAttack);

      // Health text for player and enemy
      playerHealthText = this.add.text(50, 20, `HP: ${playerHP}`, { fontSize: '16px', color: '#fff' });
      enemyHealthText = this.add.text(850, 20, `HP: ${enemyHP}`, { fontSize: '16px', color: '#fff' });
    }

    function update() {
      // Update health texts dynamically during the game
      playerHealthText.setText(`HP: ${playerHP}`);
      enemyHealthText.setText(`HP: ${enemyHP}`);
    }

    function handleAttack() {
      if (turn === 'Player') {
        const damage = Math.floor(Math.random() * 20) + 5;
        setEnemyHP((prev) => Math.max(prev - damage, 0)); // Reduce enemy HP based on attack
        setTurn('Enemy');
        setTimeout(enemyTurn, 1000);
      }
    }

    function enemyTurn() {
      if (enemyHP > 0) {
        const damage = Math.floor(Math.random() * 20) + 5;
        setPlayerHP((prev) => Math.max(prev - damage, 0)); // Reduce player HP based on enemy attack
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

  return (
    <div className={styles.gameWrapper} ref={gameRef}/>
  );
};

export default Game;
