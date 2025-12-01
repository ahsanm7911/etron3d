export default function AnnouncementHeader () {
    const message = "You're on a free plan. Upgrade to unlock private and priority generations, more polygon options, free retries, and much more!"
    return (
        <div className="bg-gray-700 p-2 text-sm">
            <p className="text-center">{message}</p>
        </div>
    )
}