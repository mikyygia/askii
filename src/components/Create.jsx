import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Create () {

    const [content, setContent] = useState("");
    const [date] = useState(() => new Date());
    const [submitError, setSubmitError] = useState("");

    const handleSubmit = async (e) => {
        // save entry to supabase
        e.preventDefault();
        setSubmitError("");

        try {
            const { error } = await supabase
                .from("entries")
                .insert([{ date, content }])
            
            
            
            if (error) {
                setSubmitError(error.message ?? "Failed to add an entry");
                return;
            }
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : String(err));
        }

        setContent("");
        alert("added!")
    }

    return (
        <div className="create-area">
            <section className="title-section">
                <p>creating an entry for </p>
                <p>{date.toDateString()}</p>
                
            </section>
            
            
                <form onSubmit={handleSubmit}  className="hero-section">
                    <section className="content">
                        <label htmlFor="entry">today's entry: </label>
                        <textarea
                            rows={6}
                            name="entry"
                            value={content}
                            placeholder=""
                            onChange={e => {setContent(e.target.value)}}
                    />

                    </section>

                    <button type="submit" className="submit-btn">+</button>
                </form>

                {submitError && <p className="status-message error">{submitError}</p>}
                
            
        </div>
    );
}
