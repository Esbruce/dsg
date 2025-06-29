export default function ConfirmPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
            <div className="bg-white shadow-xl border border-indigo-100 rounded-2xl p-10 w-full max-w-md transition-shadow hover:shadow-indigo-200 flex flex-col items-center">
                <h1 className="text-2xl font-bold mb-2 text-center text-indigo-800">Please confirm your email </h1>
                <p className="text-center text-gray-500 mb-6 text-sm">Please check your email for a confirmation link.</p>
            </div>
        </div>
    )
}


