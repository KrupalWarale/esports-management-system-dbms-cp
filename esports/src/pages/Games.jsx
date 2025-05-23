import React, { useEffect, useState } from 'react'
import { Buffer } from 'buffer'
import '../css/Games.css'
// import { Link } from 'react-router-dom'
// import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import api from '../api'
import { toast } from 'react-toastify'

const Games = () => {
    const [data1, setData1] = useState([]);
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await toast.promise( api.get("/game_details"),
                    {
                        pending: "Loading Your Portfolio",
                        success: "Data Loaded Successfully",
                        error: "Error occured"
                    }
                );
                if (response) {
                    const game = response.data;
                    setData1(game);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchGames();
    }, []);


    function upload(x) {
        localStorage.setItem("SelectedGame", x.gname);
        setTimeout(() => {
            window.location.href = "/game_team"
        }, 1000
        )
    }
    return (
        <div>
            {/* <button>{handleBack}</button> */}
            <ul className="games-card-list">
                {data1.map((cardData, index) => (
                    <li key={index} onClick={() => upload(cardData)} className="games-card">
                            <div className='roll-animation'>
                                {
                                    cardData.photo != null ?
                                        <img src={`data:image/png;base64,${Buffer.from(cardData.photo.data).toString('base64')}`} alt={cardData.gname} className='game_image' />
                                        :
                                        <img src='https://static.vecteezy.com/system/resources/thumbnails/010/884/730/small_2x/owl-head-mascot-team-logo-png.png' alt='idkl' className='game_image' />
                                }
                                <div className='games-text'>
                                    <h1 className='game-text-header'>{cardData.gname}</h1>
                                    <p className='game-text-inside'>{cardData.publisher}</p>
                                    <p className='game-text-inside'>{cardData.release_date}</p>
                                    <p className='game-text-inside'>{cardData.description}</p>
                                </div>
                            </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Games
