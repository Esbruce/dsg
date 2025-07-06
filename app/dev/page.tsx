import Limit from "../components/Limit";

export default function DevPage() {
    return (
        <div>
            <h1>Dev Page</h1>
            <Limit isVisible={true} onUpgrade={() => {}} onClose={() => {}} />
        </div>
    )
}