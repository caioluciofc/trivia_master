import io from 'socket.io-client';
import inquirer from 'inquirer';
import figlet from 'figlet';
import axios from 'axios';

const url = 'https://trivia-master.fly.dev';
// const url = 'http://localhost:3000'

let authToken;
let username;

// Authentication

async function authenticate() {
  const authChoice = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: ['Login', 'Create an account', 'Exit'],
    },
  ]);

  if (authChoice.action === 'Exit') {
    process.exit(0);
  }

  const usernameAndPassword = {
    username : 'Matthew',
    password : 'matthew'
  }

  // const usernameAndPassword = await inquirer.prompt([
  //   {
  //     type: 'input',
  //     name: 'username',
  //     message: 'Enter your username:',
  //     validate: (value) => {
  //       if (value.length >= 6) {
  //         return true;
  //       }
  //       return 'Username must be at least 6 characters long.';
  //     },
  //   },
  //   {
  //     type: 'password',
  //     name: 'password',
  //     message: 'Enter your password:',
  //     validate: (value) => {
  //       if (value.length >= 6) {
  //         return true;
  //       }
  //       return 'Password must be at least 6 characters long.';
  //     },
  //   },
  // ]);
  if (authChoice.action === 'Login') {
    try {
      const response = await axios.post(url + '/user/signin', usernameAndPassword, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      authToken = response.data.token;
      username = usernameAndPassword.username;
      return usernameAndPassword.username;
    } catch (error) {
      console.error('Login failed:', error.response.data.message);
      await authenticate();
    }
  } else if (authChoice.action === 'Create an account') {
    const passwordVerification = await inquirer.prompt([
      {
        type: 'password',
        name: 'passwordVerification',
        message: 'Enter your password again for verification:',
      },
    ]);

    if (usernameAndPassword.password === passwordVerification.passwordVerification) {
      try {
        await axios.post(url + '/user/signup', usernameAndPassword, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        await authenticate();
      } catch (error) {
        console.error('Account creation failed:', error.response.data.message);
        await authenticate();
      }
    } else {
      console.error('Password verification failed. Please try again.');
    }
  }
}

// Main Screen

async function mainScreen(username) {
  const triviaMasterHeader = await figlet('TRIVIA MASTER');
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: `\n ${triviaMasterHeader} \n Hello ${capitalize(username)}, let's play!\n`,
      choices: ['Enter Queue', 'Show scores', 'Exit'],
    },
  ]);

  return answer.option;
}

function enterQueue(username, socket) {
  return new Promise((resolve) => {
    socket.emit('enter-queue', { username }, (response) => {
      resolve(response);
    });
  });
}

async function showScores() {
  try {
    const response = await axios.get(url + '/user/ranking', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const rankings = response.data.ranking;

    const top10Header = await figlet('Top 10');
    console.log(top10Header);
    rankings.slice(0, 10).forEach((entry, index) => {
      console.log(`${index + 1}. ${entry._id} - Wins: ${entry.wins}`);
    });

    await inquirer.prompt([
      {
        type: 'list',
        name: '>',
        message: '',
        choices: ['Back to Main Screen'],
      },
    ]);
  } catch (error) {
    console.error('Error fetching rankings:', error.message);
  }
}

// Playing functions

async function startGame(roomId, username, socket) {
  console.log('\n');

  const x = 0;
  while (true) {
    const roundStatus = await startRound(roomId, username, socket);
    x + 1;
    if (roundStatus === 'FINISHED') {
      let data;
      while (true) {
        data = await emitWithTimeout(socket, 'get-result', { username }, 1500);
        console.log(data);
        if (typeof data === 'object') {
          break;
        }
      }
      console.log(`\n\n ${data.message} \n\n`);
      const winFrames = ['You Win!', 'Congratulations!', 'Well Done!'];
      const drawFrames = ['DRAW', 'WARD', 'dRaW'];
      const loseFrames = ['You Lose!', 'Sad :(', 'Game Over'];
      

      if (data.result === username) {
        await animateAsciiArt(winFrames);
      } else if (data.result === 'DRAW') {
        await animateAsciiArt(drawFrames);
      } else {
        await animateAsciiArt(loseFrames);
      }
      break;
    }
  }
  return true;
}

async function startRound(roomId, username, socket) {
  const getNextQuestion = () => {
    return new Promise((resolve) => {
      socket.emit('get-question', roomId, (question) => {
        resolve(question);
      });
    });
  };

  async function getAnswer() {
    const question = await getNextQuestion();
    const questionObj = question.question;
    console.log(questionObj.question);

    const allOptions = [...questionObj.wrongAnswers, questionObj.correctAnswer];
    const shuffledOptions = shuffleArray(allOptions);
    shuffledOptions.push('Exit Game \n');
    const timeoutDuration = 60000;
    let remainingTime = timeoutDuration / 1000;

    const answerPromise = inquirer.prompt([
      {
        type: 'list',
        name: 'chosenOption',
        message: `${questionObj.question}`,
        choices: shuffledOptions,
      },
    ]);

    const timerInterval = setInterval(() => {
      remainingTime -= 0.01;

      if (remainingTime < 0) {
        clearInterval(timerInterval);
        process.exit(0);
      } else {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Time left : ${Math.round(remainingTime)}`);
      }
    }, 10);

    const answer = await answerPromise;

    clearInterval(timerInterval);

    return answer.chosenOption;
  }

  let response;
  while (true) {
    const playerAnswer = await getAnswer();

    if (response === 'Exit Game \n') {
      process.exit(0);
    }

    response = await emitWithTimeout(
      socket,
      'player-answer',
      { answer: playerAnswer, username },
      1500,
    );
    response = response.roundStatus;

    if (response === 'FINISHED') {
      break;
    }

    if (response === 'WAITINGFORPLAYER') {
      console.log('Waiting for the other player to answer.');
      try {
        response = await awaitWithTimeout(socket, 'next-round', 60000);
        response = response.roundStatus;
      } catch (error) {
        response = 'FINISHED';
      }
    }

    if (response === 'FINISHED') {
      break;
    }
  }
  return response;
}

//// Helpers

// Helper misc Functions

async function animateAsciiArt(frames, delay = 2000) {
  for (const frame of frames) {
    await new Promise((resolve) => {
      figlet(frame, (err, data) => {
        if (err) {
          console.error('Error generating ASCII art:', err);
          resolve();
        } else {
          console.clear();
          console.log(data);
          setTimeout(resolve, delay);
        }
      });
    });
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Helper timeout functions

function emitWithTimeout(socket, event, data, timeout) {
  return Promise.race([
    new Promise((resolve, reject) => {
      socket.emit(event, data, (response) => {
        resolve(response);
      });

      setTimeout(() => {
        reject(new Error(`Timeout for ${event}`));
      }, timeout);
    }),
  ]);
}

function awaitWithTimeout(socket, event, timeout) {
  return Promise.race([
    new Promise((resolve, reject) => {
      socket.once(event, (response) => {
        resolve(response);
      });

      setTimeout(() => {
        reject(new Error(`Timeout for ${event}`));
      }, timeout);
    }),
  ]);
}

// Main application

async function main() {
  await authenticate();

  while (true) {
    const socket = io(`${url}/?token=${authToken}`);

    const selectedOption = await mainScreen(username);

    if (selectedOption === 'Enter Queue') {
      const response = await enterQueue(username, socket);
      const message = response.message;
      const statusCode = response.code;
      const roomId = response.roomId;

      if (statusCode === 'CREATED') {
        console.log(
          `Ok ${capitalize(
            username,
          )}! We created a room for you!\nPlease wait for another player to join.\n`,
        );
        const startGameResponse = await new Promise((resolve) => {
          socket.once('start-game', (response) => resolve(response));
        });
        console.log(startGameResponse.message);
      } else {
        console.log(message);
      }
      await startGame(roomId, username, socket);
    } else if (selectedOption === 'Show scores') {
      await showScores();
    } else if (selectedOption.toLowerCase() === 'exit') {
      socket.disconnect();
      process.exit(0);
    }
    console.clear();
  }
}

main();
