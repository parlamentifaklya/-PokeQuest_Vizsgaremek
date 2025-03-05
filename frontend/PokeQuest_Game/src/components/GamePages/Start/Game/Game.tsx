import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import styles from './Game.module.css';

const Game = ({ selectedFeyling }) => {
  const gameRef = useRef(null);
  const [turn, setTurn] = useState('Player');
  const [playerHP, setPlayerHP] = useState(selectedFeyling?.hp || 100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [enemyFeyling, setEnemyFeyling] = useState(null);

  useEffect(() => {
    const storedInventory = localStorage.getItem('userInventory');
    if (storedInventory) {
      const inventory = JSON.parse(storedInventory);
      if (inventory.ownedFeylings && inventory.ownedFeylings.length > 0) {
        setEnemyFeyling(inventory.ownedFeylings[0]);
      }
    }
  }, []);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 250,
      height: 400,
      parent: gameRef.current,
      scene: {
        preload,
        create,
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);

    function preload() {
      this.load.image('background', 'https://via.placeholder.com/250x400');
    }

    function create() {
      this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background').setDisplaySize(window.innerWidth, window.innerHeight);
      const attackButton = this.add.text(window.innerWidth / 2 - 50, window.innerHeight - 100, 'Attack', { fontSize: '32px', fill: '#fff' })
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

  return (
    <div className={styles.gameWrapper}>
      <div className={styles.feylingContainer}>
        {selectedFeyling && (
          <div className={styles.playerFeyling}>
            <img src={selectedFeyling.img} alt={selectedFeyling.name} />
            <p>{selectedFeyling.name}</p>
            <p>HP: {playerHP}</p>
            <p>ATK: {selectedFeyling.atk}</p>
          </div>
        )}
      </div>
      <div className={styles.gameContainer} ref={gameRef}></div>
      <div className={styles.feylingContainer}>
        {enemyFeyling && (
          <div className={styles.enemyFeyling}>
            <img src={enemyFeyling.feylingImg} alt={enemyFeyling.feylingName} />
            <p>{enemyFeyling.feylingName}</p>
            <p>HP: {enemyHP}</p>
            <p>ATK: {enemyFeyling.atk}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;