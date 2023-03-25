import { useEffect, useState } from 'react'
import PACK_OF_CARDS from '../../utils/packOfCards'
import shuffleArray from '../../utils/shuffleArray'
import io from 'socket.io-client'
import queryString from 'query-string'
import Spinner from '../../components/Spinner'
import useSound from 'use-sound'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
import styles from './index.module.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import bgMusic from '../../assets/sounds/game-bg-music.mp3'
import unoSound from '../../assets/sounds/uno-sound.mp3'
import shufflingSound from '../../assets/sounds/shuffling-cards-1.mp3'
import skipCardSound from '../../assets/sounds/skip-sound.mp3'
import draw2CardSound from '../../assets/sounds/draw2-sound.mp3'
import wildCardSound from '../../assets/sounds/wild-sound.mp3'
import draw4CardSound from '../../assets/sounds/draw4-sound.mp3'
import gameOverSound from '../../assets/sounds/game-over-sound.mp3'
import { UnoLogo, CardBack } from 'assets'
import { connectToDatabase } from "../../utils/mongodb";


//NUMBER CODES FOR ACTION CARDS
//SKIP - 404
//DRAW 2 - 252
//WILD - 300
//DRAW 4 WILD - 600

let socket
const ENDPOINT = 'https://uno-server.herokuapp.com'

const UnoPlay = ({ gold }) => {
    const router = useRouter()
    const {roomCode, pk, bet} = router.query

    console.log("roomCode", roomCode)
    console.log("pk", pk)
    console.log("bet", bet)

    //initialize socket state
    const [room, setRoom] = useState(roomCode)
    const [roomFull, setRoomFull] = useState(false)
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [winnerPlayer, setWinnerPlayer] = useState('')

    useEffect(() => {
        const connectionOptions = {
            "forceNew": true,
            "reconnectionAttempts": "Infinity",
            "timeout": 10000,
            "transports": ["websocket"]
        }
        socket = io.connect(ENDPOINT, connectionOptions)

        socket.emit('join', { room: room }, (error) => {
            if (error)
                setRoomFull(true)
        })

        //cleanup on component unmount
        return function cleanup() {
            socket.disconnect()
            //shut down connnection instance
            socket.off()
        }
    }, [])

    //initialize game state
    const [gameOver, setGameOver] = useState(true)
    const [winner, setWinner] = useState('')
    const [turn, setTurn] = useState('')
    const [player1Deck, setPlayer1Deck] = useState([])
    const [player2Deck, setPlayer2Deck] = useState([])
    const [currentColor, setCurrentColor] = useState('')
    const [currentNumber, setCurrentNumber] = useState('')
    const [playedCardsPile, setPlayedCardsPile] = useState([])
    const [drawCardPile, setDrawCardPile] = useState([])

    const [isChatBoxHidden, setChatBoxHidden] = useState(true)
    const [isUnoButtonPressed, setUnoButtonPressed] = useState(false)
    const [isSoundMuted, setSoundMuted] = useState(false)
    const [isMusicMuted, setMusicMuted] = useState(true)

    const [playBBgMusic, { pause }] = useSound(bgMusic, { loop: true })
    const [playUnoSound] = useSound(unoSound)
    const [playShufflingSound] = useSound(shufflingSound)
    const [playSkipCardSound] = useSound(skipCardSound)
    const [playDraw2CardSound] = useSound(draw2CardSound)
    const [playWildCardSound] = useSound(wildCardSound)
    const [playDraw4CardSound] = useSound(draw4CardSound)
    const [playGameOverSound] = useSound(gameOverSound)

   

    //runs once on component mount
    useEffect(() => {
        //shuffle PACK_OF_CARDS array
        const shuffledCards = shuffleArray(PACK_OF_CARDS)

        //extract first 7 elements to player1Deck
        const player1Deck = shuffledCards.splice(0, 7)

        //extract first 7 elements to player2Deck
        const player2Deck = shuffledCards.splice(0, 7)

        //extract random card from shuffledCards and check if its not an action card
        let startingCardIndex
        while (true) {
            startingCardIndex = Math.floor(Math.random() * 94)
            if (shuffledCards[startingCardIndex] === 'skipR' || shuffledCards[startingCardIndex] === '_R' || shuffledCards[startingCardIndex] === 'D2R' ||
                shuffledCards[startingCardIndex] === 'skipG' || shuffledCards[startingCardIndex] === '_G' || shuffledCards[startingCardIndex] === 'D2G' ||
                shuffledCards[startingCardIndex] === 'skipB' || shuffledCards[startingCardIndex] === '_B' || shuffledCards[startingCardIndex] === 'D2B' ||
                shuffledCards[startingCardIndex] === 'skipY' || shuffledCards[startingCardIndex] === '_Y' || shuffledCards[startingCardIndex] === 'D2Y' ||
                shuffledCards[startingCardIndex] === 'W' || shuffledCards[startingCardIndex] === 'D4W') {
                continue;
            }
            else
                break;
        }

        //extract the card from that startingCardIndex into the playedCardsPile
        const playedCardsPile = shuffledCards.splice(startingCardIndex, 1)

        //store all remaining cards into drawCardPile
        const drawCardPile = shuffledCards

        //send initial state to server
        socket.emit('initGameState', {
            gameOver: false,
            turn: 'Player 1',
            player1Deck: [...player1Deck],
            player2Deck: [...player2Deck],
            currentColor: playedCardsPile[0].charAt(1),
            currentNumber: playedCardsPile[0].charAt(0),
            playedCardsPile: [...playedCardsPile],
            drawCardPile: [...drawCardPile]
        })
    }, [])

    useEffect(() => {
        socket.on('initGameState', ({ gameOver, turn, player1Deck, player2Deck, currentColor, currentNumber, playedCardsPile, drawCardPile }) => {
            setGameOver(gameOver)
            setTurn(turn)
            setPlayer1Deck(player1Deck)
            setPlayer2Deck(player2Deck)
            setCurrentColor(currentColor)
            setCurrentNumber(currentNumber)
            setPlayedCardsPile(playedCardsPile)
            setDrawCardPile(drawCardPile)
        })

        socket.on('updateGameState', ({ gameOver, winner, turn, player1Deck, player2Deck, currentColor, currentNumber, playedCardsPile, drawCardPile }) => {
            gameOver && setGameOver(gameOver)
            gameOver === true && playGameOverSound()
            winner && setWinner(winner)
            turn && setTurn(turn)
            player1Deck && setPlayer1Deck(player1Deck)
            player2Deck && setPlayer2Deck(player2Deck)
            currentColor && setCurrentColor(currentColor)
            currentNumber && setCurrentNumber(currentNumber)
            playedCardsPile && setPlayedCardsPile(playedCardsPile)
            drawCardPile && setDrawCardPile(drawCardPile)
            setUnoButtonPressed(false)
        })

        socket.on("roomData", ({ users }) => {
            setUsers(users)
        })

        socket.on('currentUserData', ({ name }) => {
            setCurrentUser(name)
        })

        socket.on('message', message => {
            setMessages(messages => [...messages, message])

            const chatBody = document.getElementById('chatting')
            chatBody.scrollTop = chatBody.scrollHeight
        })
    }, [])

    //some util functions
    const checkGameOver = (arr) => {
        return arr.length === 1
    }

    const updateGold = async (goldCount) => {
        console.log('girdi')
        console.log(goldCount)
        const putGold = async () => {
          const data = {
            publicKey: pk,
            gold: goldCount,
          };
      
          const response = await fetch('/api/gold/', {
            method: 'PUT',
            body: JSON.stringify(data),
          })
          return response.json();
        }
        try {
          putGold().then(() => {
            toast(`Done`, { hideProgressBar: true, autoClose: 2500, type: 'info' ,position:"top-left"})
          })
        } catch(err){
          toast(err, { hideProgressBar: true, autoClose: 2500, type: 'error' ,position:'top-left' })
        }
      }

      const getGoldCount = (publicKey) => {
        const goldCount = gold.find(g => g.publicKey === publicKey);
        if(goldCount === undefined){
          return 0
        }
        return goldCount.gold
      }

    const checkWinner = (arr, player) => {
        if(arr.length === 1){
            try {
                if(player === currentUser){
                    updateGold(getGoldCount(pk) + bet*0.95).then(() => {
                        toast(`You won ${(bet*0.95).toFixed(2)} Quack Golds.`, { hideProgressBar: true, autoClose: 2500, type: 'info' ,position:"top-left"})
                    })
                } else {
                    toast(`You lose ${bet.toFixed(2)} Quack Golds.`, { hideProgressBar: true, autoClose: 2500, type: 'info' ,position:"top-left"})
                }
            } catch(err){
                toast(err, { hideProgressBar: true, autoClose: 2500, type: 'error' ,position:'top-left' })
            }
            return player
        } else {
            return ''
        }
    }

    const toggleChatBox = () => {
        const chatBody = document.getElementById('chatting')
        if (isChatBoxHidden) {
            chatBody.style.display = 'block'
            setChatBoxHidden(false)
        }
        else {
            chatBody.style.display = 'none'
            setChatBoxHidden(true)
        }
    }

    const sendMessage = (event) => {
        event.preventDefault()
        if (message) {
            socket.emit('sendMessage', { message: message }, () => {
                setMessage('')
            })
        }
    }

    //driver functions
    const onCardPlayedHandler = (played_card) => {
        //extract player who played the card
        const cardPlayedBy = turn
        switch (played_card) {
            //if card played was a number card
            case '0R': case '1R': case '2R': case '3R': case '4R': case '5R': case '6R': case '7R': case '8R': case '9R': case '_R': case '0G': case '1G': case '2G': case '3G': case '4G': case '5G': case '6G': case '7G': case '8G': case '9G': case '_G': case '0B': case '1B': case '2B': case '3B': case '4B': case '5B': case '6B': case '7B': case '8B': case '9B': case '_B': case '0Y': case '1Y': case '2Y': case '3Y': case '4Y': case '5Y': case '6Y': case '7Y': case '8Y': case '9Y': case '_Y': {
                //extract number and color of played card
                const numberOfPlayedCard = played_card.charAt(0)
                const colorOfPlayedCard = played_card.charAt(1)
                //check for color match
                if (currentColor === colorOfPlayedCard) {
                    console.log('colors matched!')
                    //check who played the card and return new state accordingly
                    if (cardPlayedBy === 'Player 1') {
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        //then update turn, currentColor and currentNumber
                        const removeIndex = player1Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player1Deck.length === 2 && !isUnoButtonPressed) {
                            // alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})
                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            updatedPlayer1Deck.push(drawCard1)
                            updatedPlayer1Deck.push(drawCard2)
                            !isSoundMuted && playShufflingSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                turn: 'Player 2',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...updatedPlayer1Deck],
                                currentColor: colorOfPlayedCard,
                                currentNumber: numberOfPlayedCard,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playShufflingSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                turn: 'Player 2',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: numberOfPlayedCard
                            })
                        }
                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //then update turn, currentColor and currentNumber
                        const removeIndex = player2Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player2Deck.length === 2 && !isUnoButtonPressed) {
                            // alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            updatedPlayer2Deck.push(drawCard1)
                            updatedPlayer2Deck.push(drawCard2)
                            !isSoundMuted && playShufflingSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                turn: 'Player 1',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...updatedPlayer2Deck],
                                currentColor: colorOfPlayedCard,
                                currentNumber: numberOfPlayedCard,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playShufflingSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                turn: 'Player 1',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: numberOfPlayedCard
                            })
                        }
                    }
                }
                //check for number match
                else if (currentNumber === numberOfPlayedCard) {
                    console.log('numbers matched!')
                    //check who played the card and return new state accordingly
                    if (cardPlayedBy === 'Player 1') {
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        //then update turn, currentColor and currentNumber
                        const removeIndex = player1Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player1Deck.length === 2 && !isUnoButtonPressed) {
                            //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})
                            
                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            updatedPlayer1Deck.push(drawCard1)
                            updatedPlayer1Deck.push(drawCard2)
                            !isSoundMuted && playShufflingSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                turn: 'Player 2',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...updatedPlayer1Deck],
                                currentColor: colorOfPlayedCard,
                                currentNumber: numberOfPlayedCard,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playShufflingSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                turn: 'Player 2',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: numberOfPlayedCard
                            })
                        }
                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //then update turn, currentColor and currentNumber
                        const removeIndex = player2Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player2Deck.length === 2 && !isUnoButtonPressed) {
                            //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})
                            
                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            updatedPlayer2Deck.push(drawCard1)
                            updatedPlayer2Deck.push(drawCard2)
                            !isSoundMuted && playShufflingSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                turn: 'Player 1',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...updatedPlayer2Deck],
                                currentColor: colorOfPlayedCard,
                                currentNumber: numberOfPlayedCard,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playShufflingSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                turn: 'Player 1',
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: numberOfPlayedCard
                            })
                        }
                    }
                }
                //if no color or number match, invalid move - do not update state
                else {
                    //alert('Invalid Move!')
                    toast('Invalid Move!', { hideProgressBar: true, autoClose: 2000, type: 'warning' ,position:"top-left"})
                }
                break;
            }
            //if card played was a skip card
            case 'skipR': case 'skipG': case 'skipB': case 'skipY': {
                //extract color of played skip card
                const colorOfPlayedCard = played_card.charAt(4)
                //check for color match
                if (currentColor === colorOfPlayedCard) {
                    console.log('colors matched!')
                    //check who played the card and return new state accordingly
                    if (cardPlayedBy === 'Player 1') {
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        //then update currentColor and currentNumber
                        const removeIndex = player1Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player1Deck.length === 2 && !isUnoButtonPressed) {
                            // alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            updatedPlayer1Deck.push(drawCard1)
                            updatedPlayer1Deck.push(drawCard2)
                            !isSoundMuted && playSkipCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...updatedPlayer1Deck],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 404,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playSkipCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 404
                            })
                        }
                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //then update currentColor and currentNumber
                        const removeIndex = player2Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player2Deck.length === 2 && !isUnoButtonPressed) {
                            //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            updatedPlayer2Deck.push(drawCard1)
                            updatedPlayer2Deck.push(drawCard2)
                            !isSoundMuted && playSkipCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...updatedPlayer2Deck],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 404,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playSkipCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 404
                            })
                        }
                    }
                }
                //check for number match - if skip card played on skip card
                else if (currentNumber === 404) {
                    console.log('Numbers matched!')
                    //check who played the card and return new state accordingly
                    if (cardPlayedBy === 'Player 1') {
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        //then update currentColor and currentNumber - turn will remain same
                        const removeIndex = player1Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player1Deck.length === 2 && !isUnoButtonPressed) {
                            //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            updatedPlayer1Deck.push(drawCard1)
                            updatedPlayer1Deck.push(drawCard2)
                            !isSoundMuted && playSkipCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...updatedPlayer1Deck],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 404,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playSkipCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 404
                            })
                        }
                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //then update currentColor and currentNumber - turn will remain same
                        const removeIndex = player2Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player2Deck.length === 2 && !isUnoButtonPressed) {
                            //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                            //make a copy of drawCardPile array
                            const copiedDrawCardPileArray = [...drawCardPile]
                            //pull out last two elements from it
                            const drawCard1 = copiedDrawCardPileArray.pop()
                            const drawCard2 = copiedDrawCardPileArray.pop()
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            updatedPlayer2Deck.push(drawCard1)
                            updatedPlayer2Deck.push(drawCard2)
                            !isSoundMuted && playSkipCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...updatedPlayer2Deck],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 404,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playSkipCardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 2'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 404
                            })
                        }
                    }
                }
                //if no color or number match, invalid move - do not update state
                else {
                    //alert('Invalid Move!')
                    toast('Invalid Move!', { hideProgressBar: true, autoClose: 2000, type: 'warning' ,position:"top-left"})

                }
                break;
            }
            //if card played was a draw 2 card
            case 'D2R': case 'D2G': case 'D2B': case 'D2Y': {
                //extract color of played skip card
                const colorOfPlayedCard = played_card.charAt(2)
                //check for color match
                if (currentColor === colorOfPlayedCard) {
                    console.log('colors matched!')
                    //check who played the card and return new state accordingly
                    if (cardPlayedBy === 'Player 1') {
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                        //then update currentColor and currentNumber - turn will remain same
                        const removeIndex = player1Deck.indexOf(played_card)
                        //make a copy of drawCardPile array
                        const copiedDrawCardPileArray = [...drawCardPile]
                        //pull out last two elements from it
                        const drawCard1 = copiedDrawCardPileArray.pop()
                        const drawCard2 = copiedDrawCardPileArray.pop()
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player1Deck.length === 2 && !isUnoButtonPressed) {
                            //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                            //pull out last two elements from drawCardPile
                            const drawCard1X = copiedDrawCardPileArray.pop()
                            const drawCard2X = copiedDrawCardPileArray.pop()
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            updatedPlayer1Deck.push(drawCard1X)
                            updatedPlayer1Deck.push(drawCard2X)
                            !isSoundMuted && playDraw2CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 252,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playDraw2CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 252,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                        //then update currentColor and currentNumber - turn will remain same
                        const removeIndex = player2Deck.indexOf(played_card)
                        //make a copy of drawCardPile array
                        const copiedDrawCardPileArray = [...drawCardPile]
                        //pull out last two elements from it
                        const drawCard1 = copiedDrawCardPileArray.pop()
                        const drawCard2 = copiedDrawCardPileArray.pop()
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player2Deck.length === 2 && !isUnoButtonPressed) {
                            //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                            //pull out last two elements from drawCardPile
                            const drawCard1X = copiedDrawCardPileArray.pop()
                            const drawCard2X = copiedDrawCardPileArray.pop()
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            updatedPlayer2Deck.push(drawCard1X)
                            updatedPlayer2Deck.push(drawCard2X)
                            !isSoundMuted && playDraw2CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...updatedPlayer2Deck],
                                player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 252,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playDraw2CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 252,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                    }
                }
                //check for number match - if draw 2 card played on draw 2 card
                else if (currentNumber === 252) {
                    console.log('number matched!')
                    //check who played the card and return new state accordingly
                    if (cardPlayedBy === 'Player 1') {
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                        //then update currentColor and currentNumber - turn will remain same
                        const removeIndex = player1Deck.indexOf(played_card)
                        //make a copy of drawCardPile array
                        const copiedDrawCardPileArray = [...drawCardPile]
                        //pull out last two elements from it
                        const drawCard1 = copiedDrawCardPileArray.pop()
                        const drawCard2 = copiedDrawCardPileArray.pop()
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player1Deck.length === 2 && !isUnoButtonPressed) {
                            // alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                            //pull out last two elements from drawCardPile
                            const drawCard1X = copiedDrawCardPileArray.pop()
                            const drawCard2X = copiedDrawCardPileArray.pop()
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            updatedPlayer1Deck.push(drawCard1X)
                            updatedPlayer1Deck.push(drawCard2X)
                            !isSoundMuted && playDraw2CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...updatedPlayer1Deck],
                                player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 252,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playDraw2CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player1Deck),
                                winner: checkWinner(player1Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                                player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 252,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                        //then update currentColor and currentNumber - turn will remain same
                        const removeIndex = player2Deck.indexOf(played_card)
                        //make a copy of drawCardPile array
                        const copiedDrawCardPileArray = [...drawCardPile]
                        //pull out last two elements from it
                        const drawCard1 = copiedDrawCardPileArray.pop()
                        const drawCard2 = copiedDrawCardPileArray.pop()
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if (player2Deck.length === 2 && !isUnoButtonPressed) {
                            //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                            toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                            //pull out last two elements from drawCardPile
                            const drawCard1X = copiedDrawCardPileArray.pop()
                            const drawCard2X = copiedDrawCardPileArray.pop()
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            updatedPlayer2Deck.push(drawCard1X)
                            updatedPlayer2Deck.push(drawCard2X)
                            !isSoundMuted && playDraw2CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...updatedPlayer2Deck],
                                player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 252,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                        else {
                            !isSoundMuted && playDraw2CardSound()
                            //send new state to server
                            socket.emit('updateGameState', {
                                gameOver: checkGameOver(player2Deck),
                                winner: checkWinner(player2Deck, 'Player 1'),
                                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                                player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                                player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                                currentColor: colorOfPlayedCard,
                                currentNumber: 252,
                                drawCardPile: [...copiedDrawCardPileArray]
                            })
                        }
                    }
                }
                //if no color or number match, invalid move - do not update state
                else {
                    //alert('Invalid Move!')
                    toast('Invalid Move!', { hideProgressBar: true, autoClose: 2000, type: 'warning' ,position:"top-left"})

                }
                break;
            }
            //if card played was a wild card
            case 'W': {
                //check who played the card and return new state accordingly
                if (cardPlayedBy === 'Player 1') {
                    //ask for new color
                    let newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                    while(newColor !== "R" && newColor !== "G" && newColor !== "B" && newColor !== "Y"){
                        newColor = prompt('Please provide a valid letter!').toUpperCase()
                    }
                    //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                    const removeIndex = player1Deck.indexOf(played_card)
                    //then update turn, currentColor and currentNumber
                    //if two cards remaining check if player pressed UNO button
                    //if not pressed add 2 cards as penalty
                    if (player1Deck.length === 2 && !isUnoButtonPressed) {
                        //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                        toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                        //make a copy of drawCardPile array
                        const copiedDrawCardPileArray = [...drawCardPile]
                        //pull out last two elements from it
                        const drawCard1 = copiedDrawCardPileArray.pop()
                        const drawCard2 = copiedDrawCardPileArray.pop()
                        const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                        updatedPlayer1Deck.push(drawCard1)
                        updatedPlayer1Deck.push(drawCard2)
                        !isSoundMuted && playWildCardSound()
                        //send new state to server
                        socket.emit('updateGameState', {
                            gameOver: checkGameOver(player1Deck),
                            winner: checkWinner(player1Deck, 'Player 1'),
                            turn: 'Player 2',
                            playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                            player1Deck: [...updatedPlayer1Deck],
                            currentColor: newColor,
                            currentNumber: 300,
                            drawCardPile: [...copiedDrawCardPileArray]
                        })
                    }
                    else {
                        !isSoundMuted && playWildCardSound()
                        //send new state to server
                        socket.emit('updateGameState', {
                            gameOver: checkGameOver(player1Deck),
                            winner: checkWinner(player1Deck, 'Player 1'),
                            turn: 'Player 2',
                            playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                            player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                            currentColor: newColor,
                            currentNumber: 300
                        })
                    }

                }
                else {
                    //ask for new color
                    let newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                    while(newColor !== "R" && newColor !== "G" && newColor !== "B" && newColor !== "Y"){
                        newColor = prompt('Please provide a valid letter!').toUpperCase()
                    }
                    //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                    const removeIndex = player2Deck.indexOf(played_card)
                    //then update turn, currentColor and currentNumber
                    //if two cards remaining check if player pressed UNO button
                    //if not pressed add 2 cards as penalty
                    if (player2Deck.length === 2 && !isUnoButtonPressed) {
                        //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                        toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                        //make a copy of drawCardPile array
                        const copiedDrawCardPileArray = [...drawCardPile]
                        //pull out last two elements from it
                        const drawCard1 = copiedDrawCardPileArray.pop()
                        const drawCard2 = copiedDrawCardPileArray.pop()
                        const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                        updatedPlayer2Deck.push(drawCard1)
                        updatedPlayer2Deck.push(drawCard2)
                        !isSoundMuted && playWildCardSound()
                        //send new state to server
                        socket.emit('updateGameState', {
                            gameOver: checkGameOver(player2Deck),
                            winner: checkWinner(player2Deck, 'Player 2'),
                            turn: 'Player 1',
                            playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                            player2Deck: [...updatedPlayer2Deck],
                            currentColor: newColor,
                            currentNumber: 300,
                            drawCardPile: [...copiedDrawCardPileArray]
                        })
                    }
                    else {
                        !isSoundMuted && playWildCardSound()
                        //send new state to server
                        socket.emit('updateGameState', {
                            gameOver: checkGameOver(player2Deck),
                            winner: checkWinner(player2Deck, 'Player 2'),
                            turn: 'Player 1',
                            playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                            player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                            currentColor: newColor,
                            currentNumber: 300
                        })
                    }
                }
                break;
            }
            //if card played was a draw four wild card
            case 'D4W': {
                //check who played the card and return new state accordingly
                if (cardPlayedBy === 'Player 1') {
                    //ask for new color
                    let newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                    while(newColor !== "R" && newColor !== "G" && newColor !== "B" && newColor !== "Y"){
                        newColor = prompt('Please provide a valid letter!').toUpperCase()
                    }
                    //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                    const removeIndex = player1Deck.indexOf(played_card)
                    //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                    //make a copy of drawCardPile array
                    const copiedDrawCardPileArray = [...drawCardPile]
                    //pull out last four elements from it
                    const drawCard1 = copiedDrawCardPileArray.pop()
                    const drawCard2 = copiedDrawCardPileArray.pop()
                    const drawCard3 = copiedDrawCardPileArray.pop()
                    const drawCard4 = copiedDrawCardPileArray.pop()
                    //then update currentColor and currentNumber - turn will remain same
                    //if two cards remaining check if player pressed UNO button
                    //if not pressed add 2 cards as penalty
                    if (player1Deck.length === 2 && !isUnoButtonPressed) {
                        //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                        toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                        //pull out last two elements from drawCardPile
                        const drawCard1X = copiedDrawCardPileArray.pop()
                        const drawCard2X = copiedDrawCardPileArray.pop()
                        const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                        updatedPlayer1Deck.push(drawCard1X)
                        updatedPlayer1Deck.push(drawCard2X)
                        !isSoundMuted && playDraw4CardSound()
                        //send new state to server
                        socket.emit('updateGameState', {
                            gameOver: checkGameOver(player1Deck),
                            winner: checkWinner(player1Deck, 'Player 1'),
                            playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                            player1Deck: [...updatedPlayer1Deck],
                            player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player2Deck.slice(player2Deck.length)],
                            currentColor: newColor,
                            currentNumber: 600,
                            drawCardPile: [...copiedDrawCardPileArray]
                        })

                    }
                    else {
                        !isSoundMuted && playDraw4CardSound()
                        //send new state to server
                        socket.emit('updateGameState', {
                            gameOver: checkGameOver(player1Deck),
                            winner: checkWinner(player1Deck, 'Player 1'),
                            playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                            player1Deck: [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)],
                            player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player2Deck.slice(player2Deck.length)],
                            currentColor: newColor,
                            currentNumber: 600,
                            drawCardPile: [...copiedDrawCardPileArray]
                        })
                    }
                }
                else {
                    //ask for new color
                    let newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                    while(newColor !== "R" && newColor !== "G" && newColor !== "B" && newColor !== "Y"){
                        newColor = prompt('Please provide a valid letter!').toUpperCase()
                    }
                    //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                    const removeIndex = player2Deck.indexOf(played_card)
                    //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                    //make a copy of drawCardPile array
                    const copiedDrawCardPileArray = [...drawCardPile]
                    //pull out last four elements from it
                    const drawCard1 = copiedDrawCardPileArray.pop()
                    const drawCard2 = copiedDrawCardPileArray.pop()
                    const drawCard3 = copiedDrawCardPileArray.pop()
                    const drawCard4 = copiedDrawCardPileArray.pop()
                    //then update currentColor and currentNumber - turn will remain same
                    !isSoundMuted && playDraw4CardSound()
                    //send new state to server
                    socket.emit('updateGameState', {
                        gameOver: checkGameOver(player2Deck),
                        winner: checkWinner(player2Deck, 'Player 2'),
                        playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                        player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                        player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)],
                        currentColor: newColor,
                        currentNumber: 600,
                        drawCardPile: [...copiedDrawCardPileArray]
                    })
                    //if two cards remaining check if player pressed UNO button
                    //if not pressed add 2 cards as penalty
                    if (player2Deck.length === 2 && !isUnoButtonPressed) {
                        //alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
                        toast('Oops! You forgot to press UNO. You drew 2 cards as penalty.', { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                        //pull out last two elements from drawCardPile
                        const drawCard1X = copiedDrawCardPileArray.pop()
                        const drawCard2X = copiedDrawCardPileArray.pop()
                        const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                        updatedPlayer2Deck.push(drawCard1X)
                        updatedPlayer2Deck.push(drawCard2X)
                        !isSoundMuted && playDraw4CardSound()
                        //send new state to server
                        socket.emit('updateGameState', {
                            gameOver: checkGameOver(player2Deck),
                            winner: checkWinner(player2Deck, 'Player 2'),
                            playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                            player2Deck: [...updatedPlayer2Deck],
                            player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)],
                            currentColor: newColor,
                            currentNumber: 600,
                            drawCardPile: [...copiedDrawCardPileArray]
                        })
                    }
                    else {
                        !isSoundMuted && playDraw4CardSound()
                        //send new state to server
                        socket.emit('updateGameState', {
                            gameOver: checkGameOver(player2Deck),
                            winner: checkWinner(player2Deck, 'Player 2'),
                            playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                            player2Deck: [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)],
                            player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)],
                            currentColor: newColor,
                            currentNumber: 600,
                            drawCardPile: [...copiedDrawCardPileArray]
                        })
                    }
                }
            }
                break;
        }
    }

    const onCardDrawnHandler = () => {
        //extract player who drew the card
        const cardDrawnBy = turn
        //check who drew the card and return new state accordingly
        if (cardDrawnBy === 'Player 1') {
            //remove 1 new card from drawCardPile and add it to player1's deck (immutably)
            //make a copy of drawCardPile array
            const copiedDrawCardPileArray = [...drawCardPile]
            //pull out last element from it
            const drawCard = copiedDrawCardPileArray.pop()
            //extract number and color of drawn card
            const colorOfDrawnCard = drawCard.charAt(drawCard.length - 1)
            let numberOfDrawnCard = drawCard.charAt(0)
            if (colorOfDrawnCard === currentColor && (drawCard === 'skipR' || drawCard === 'skipG' || drawCard === 'skipB' || drawCard === 'skipY')) {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: 404,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            else if (colorOfDrawnCard === currentColor && (drawCard === 'D2R' || drawCard === 'D2G' || drawCard === 'D2B' || drawCard === 'D2Y')) {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw2CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: 252,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            else if (drawCard === 'W') {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})
                //ask for new color
                let newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                while(newColor !== "R" && newColor !== "G" && newColor !== "B" && newColor !== "Y"){
                    newColor = prompt('Please provide a valid letter!').toUpperCase()
                }
                !isSoundMuted && playWildCardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 2',
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: newColor,
                    currentNumber: 300,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            else if (drawCard === 'D4W') {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})
                //ask for new color
                let newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                while(newColor !== "R" && newColor !== "G" && newColor !== "B" && newColor !== "Y"){
                    newColor = prompt('Please provide a valid letter!').toUpperCase()
                }
                //remove 2 new cards from drawCardPile and add them to player2's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last four elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                const drawCard3 = copiedDrawCardPileArray.pop()
                const drawCard4 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw4CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player2Deck.slice(player2Deck.length)],
                    currentColor: newColor,
                    currentNumber: 600,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            //if not action card - check if drawn card is playable
            else if (numberOfDrawnCard === currentNumber || colorOfDrawnCard === currentColor) {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 2',
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: numberOfDrawnCard,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            //else add the drawn card to player1's deck
            else {
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 2',
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard, ...player1Deck.slice(player1Deck.length)],
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
        }
        else {
            //remove 1 new card from drawCardPile and add it to player2's deck (immutably)
            //make a copy of drawCardPile array
            const copiedDrawCardPileArray = [...drawCardPile]
            //pull out last element from it
            const drawCard = copiedDrawCardPileArray.pop()
            //extract number and color of drawn card
            const colorOfDrawnCard = drawCard.charAt(drawCard.length - 1)
            let numberOfDrawnCard = drawCard.charAt(0)
            if (colorOfDrawnCard === currentColor && (drawCard === 'skipR' || drawCard === 'skipG' || drawCard === 'skipB' || drawCard === 'skipY')) {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: 404,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            else if (colorOfDrawnCard === currentColor && (drawCard === 'D2R' || drawCard === 'D2G' || drawCard === 'D2B' || drawCard === 'D2Y')) {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw2CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: 252,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            else if (drawCard === 'W') {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})
                //ask for new color
                let newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                while(newColor !== "R" && newColor !== "G" && newColor !== "B" && newColor !== "Y"){
                    newColor = prompt('Please provide a valid letter!').toUpperCase()
                }
                !isSoundMuted && playWildCardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 1',
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: newColor,
                    currentNumber: 300,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            else if (drawCard === 'D4W') {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})
                //ask for new color
                let newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                while(newColor !== "R" && newColor !== "G" && newColor !== "B" && newColor !== "Y"){
                    newColor = prompt('Please provide a valid letter!').toUpperCase()
                }
                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last four elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                const drawCard3 = copiedDrawCardPileArray.pop()
                const drawCard4 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw4CardSound()
                //send new state to server
                socket.emit('updateGameState', {
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)],
                    currentColor: newColor,
                    currentNumber: 600,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            //if not action card - check if drawn card is playable
            else if (numberOfDrawnCard === currentNumber || colorOfDrawnCard === currentColor) {
                //alert(`You drew ${drawCard}. It was played for you.`)
                toast(`You drew ${drawCard}. It was played for you.`, { hideProgressBar: true, autoClose: 3000, type: 'info' ,position:"top-left"})

                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 1',
                    playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), drawCard, ...playedCardsPile.slice(playedCardsPile.length)],
                    currentColor: colorOfDrawnCard,
                    currentNumber: numberOfDrawnCard,
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
            //else add the drawn card to player2's deck
            else {
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 1',
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard, ...player2Deck.slice(player2Deck.length)],
                    drawCardPile: [...copiedDrawCardPileArray]
                })
            }
        }
    }

    return (
        <div className={
            currentColor === 'R' ?
                `${styles.Game} ${styles.backgroundColorR}` :
                    ( currentColor === 'G' ? `${styles.Game} ${styles.backgroundColorG}` : 
                        (currentColor === 'B' ? `${styles.Game} ${styles.backgroundColorB}` : 
                            (`${styles.Game} ${styles.backgroundColorY}`)))}>
            <ToastContainer/>
            {(!roomFull) ? <>
                <div className={styles.topInfo}>
                    <Image
                        src={UnoLogo}
                        width={100}
                        height={100}
                    />
                    <h1>Game Code: {room}</h1>
                    <span>
                        <button className={`${styles.gameButton} ${styles.green}`} onClick={() => setSoundMuted(!isSoundMuted)}>{isSoundMuted ? <span className="material-icons">volume_off</span> : <span className="material-icons">volume_up</span>}</button>
                        <button className={`${styles.gameButton} ${styles.green}`} onClick={() => {
                            if (isMusicMuted)
                                playBBgMusic()
                            else
                                pause()
                            setMusicMuted(!isMusicMuted)
                        }}>{isMusicMuted ? <span className="material-icons">music_off</span> : <span className="material-icons">music_note</span>}</button>
                    </span>
                </div>

                {/* PLAYER LEFT MESSAGES */}
                {users.length === 1 && currentUser === 'Player 2' && <h1 className={styles.topInfoText}>Player 1 has left the game.</h1>}
                {users.length === 1 && currentUser === 'Player 1' && <h1 className={styles.topInfoText}>Waiting for Player 2 to join the game.</h1>}

                {users.length === 2 && <>

                    {gameOver ? 
                        <div>
                            {winnerPlayer === '' &&
                                <>
                                    {
                                        winner !== '' && 
                                        <>
                                            <h1 className={styles.gameOver}>GAME OVER</h1>
                                            <br/>
                                            <h2>{winner === currentUser ? 'You win!' : 'You lose!'}</h2>
                                            {winner === currentUser && 
                                                setWinnerPlayer(currentUser)}
                                        </>
                                    }
                                </>
                            }
                        </div> :
                        <div>
                            {/* PLAYER 1 VIEW */}
                            {currentUser === 'Player 1' && <>
                                <div className={styles.player2Deck} style={{ pointerEvents: 'none' }}>
                                    <p className={styles.playerDeckText}>Player 2</p>
                                    {player2Deck.map((item, i) => (
                                        <div 
                                            className={styles.Card} key={i}
                                            onClick={() => onCardPlayedHandler(item)}>
                                             <Image
                                                src={CardBack}
                                                width={80}
                                                height={120}
                                            />
                                        </div>
                                    ))}
                                    {turn === 'Player 2' && <Spinner />}
                                </div>
                                <br />
                                <div className={styles.middleInfo} style={turn === 'Player 2' ? { pointerEvents: 'none' } : null}>
                                    <button className={styles.gameButton} disabled={turn !== 'Player 1'} onClick={onCardDrawnHandler}>DRAW CARD</button>
                                    {playedCardsPile && playedCardsPile.length > 0 &&
                                        <div className={styles.Card}>
                                             <Image
                                                src={require(`../../assets/cards-front/${playedCardsPile[playedCardsPile.length - 1]}.png`).default}
                                                width={80}
                                                height={120}
                                            />
                                        </div>}
                                    <button className={`${styles.gameButton} ${styles.orange}`} disabled={player1Deck.length !== 2} onClick={() => {
                                        setUnoButtonPressed(!isUnoButtonPressed)
                                        playUnoSound()
                                    }}>UNO</button>
                                </div>
                                <br />
                                <div className={styles.player1Deck} style={turn === 'Player 1' ? null : { pointerEvents: 'none' }}>
                                    <p className={styles.playerDeckText}>Player 1</p>
                                    {player1Deck.map((item, i) => (
                                        <div className={styles.Card} key={i} onClick={() => onCardPlayedHandler(item)}>
                                            <Image
                                                src={require(`../../assets/cards-front/${item}.png`).default}
                                                width={80}
                                                height={120}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.chatBoxWrapper}>
                                    <div className={`${styles.chatBox} ${styles.chatBoxPlayer1}`}>
                                        <div className={styles.chatHead}>
                                            <h2>Chat Box</h2>
                                            {!isChatBoxHidden ?
                                                <span onClick={toggleChatBox} className="material-icons">keyboard_arrow_down</span> :
                                                <span onClick={toggleChatBox} className="material-icons">keyboard_arrow_up</span>}
                                        </div>
                                        <div id='chatting' className={styles.chatBody}>
                                            <div className={styles.msgInsert}>
                                                {messages.map(msg => {
                                                    if (msg.user === 'Player 2')
                                                        return <div className={styles.msgReceive}>{msg.text}</div>
                                                    if (msg.user === 'Player 1')
                                                        return <div className={styles.msgSend}>{msg.text}</div>
                                                })}
                                            </div>
                                            <div className={styles.chatText}>
                                                <input type='text' placeholder='Type a message...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key === 'Enter' && sendMessage(event)} />
                                            </div>
                                        </div>
                                    </div>
                                </div> </>}

                            {/* PLAYER 2 VIEW */}
                            {currentUser === 'Player 2' && <>
                                <div className={styles.player1Deck} style={{ pointerEvents: 'none' }}>
                                    <p className={styles.playerDeckText}>Player 1</p>
                                    {player1Deck.map((item, i) => (
                                        <div  key={i}
                                            className={styles.Card}
                                            onClick={() => onCardPlayedHandler(item)}>
                                            <Image
                                                src={require(`../../assets/card-back.png`).default}
                                                width={80}
                                                height={120}
                                            />
                                        </div>
                                    ))}
                                    {turn === 'Player 1' && <Spinner />}
                                </div>
                                <br />
                                <div className={styles.middleInfo} style={turn === 'Player 1' ? { pointerEvents: 'none' } : null}>
                                    <button className={styles.gameButton} disabled={turn !== 'Player 2'} onClick={onCardDrawnHandler}>DRAW CARD</button>
                                    {playedCardsPile && playedCardsPile.length > 0 &&
                                    <div className={styles.Card}>
                                         <Image
                                            src={require(`../../assets/cards-front/${playedCardsPile[playedCardsPile.length - 1]}.png`).default}
                                            width={80}
                                            height={120}
                                        />
                                    </div>}
                                    <button className={`${styles.gameButton} ${styles.orange}`} disabled={player2Deck.length !== 2} onClick={() => {
                                        setUnoButtonPressed(!isUnoButtonPressed)
                                        playUnoSound()
                                    }}>UNO</button>
                                </div>
                                <br />
                                <div className={styles.player2Deck} style={turn === 'Player 1' ? { pointerEvents: 'none' } : null}>
                                    <p className={styles.playerDeckText}>Player 2</p>
                                    {player2Deck.map((item, i) => (
                                        <div  key={i}
                                        className={styles.Card}
                                        onClick={() => onCardPlayedHandler(item)}>
                                            <Image
                                                src={require(`../../assets/cards-front/${item}.png`).default}
                                                width={80}
                                                height={120}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.chatBoxWrapper}>
                                    <div className={`${styles.chatBox} ${styles.chatBoxPlayer2}`}>
                                        <div className={styles.chatHead}>
                                            <h2>Chat Box</h2>
                                            {!isChatBoxHidden ?
                                                <span onClick={toggleChatBox} className="material-icons">keyboard_arrow_down</span> :
                                                <span onClick={toggleChatBox} className="material-icons">keyboard_arrow_up</span>}
                                        </div>
                                        <div id='chatting' className={styles.chatBody}>
                                            <div className={styles.msgInsert}>
                                                {messages.map(msg => {
                                                    if (msg.user === 'Player 1')
                                                        return <div className={styles.msgReceive}>{msg.text}</div>
                                                    if (msg.user === 'Player 2')
                                                        return <div className={styles.msgSend}>{msg.text}</div>
                                                })}
                                            </div>
                                            <div className={styles.chatText}>
                                                <input type='text' placeholder='Type a message...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key === 'Enter' && sendMessage(event)} />
                                            </div>
                                        </div>
                                    </div>
                                </div> </>}
                        </div>}
                </>}
            </> : <h1>Room full</h1>}

            <br />
            <Link href={"/"}>
                <a><button className={`${styles.gameButton} ${styles.red}`}>QUIT</button></a>
            </Link>
        </div>
    )
}

const Index = ({id}) => {
    return(<div>{id}</div>)
  }
  
  Index.getInitialProps = async ({ query }) => {
    const {id} = query
  
    return {id}
  }

export default UnoPlay

export async function getServerSideProps() {
    const { db } = await connectToDatabase();
  
    const gold = await db
      .collection("gold")
      .find()
      .toArray();
  
    return {
      props: {
        gold: JSON.parse(JSON.stringify(gold)),
      },
    };
  }