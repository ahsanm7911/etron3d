import { Link } from 'react-router-dom';
export default function AnnouncementHeader () {

    return (
        <div className="bg-gray-700 p-2 text-sm">
            <p className="text-center">You're on a free plan. <Link className="underline text-yellow-300" to="/pricing">Upgrade</Link> to unlock private and priority generations, more polygon options, free retries, and much more!</p>
        </div>
    )
}
