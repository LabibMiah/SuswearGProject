import "./homepage.css";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
    return (
        <main className="Main-ContainerBox">

            {/* Welcome Section */}
            <section className="Welcome-Info">

                <div className="Welcome-Left-Box">
                    <h1><strong>Welcome To SustainWear!</strong></h1>
                    <p>We are the organisation that distributes your donated clothes for better purposes!</p>

                    {/* Buttons for Login register / Shop */}
                    <div className="Home-Button-area">
                        <a href="/login" className="button">Login</a>
                        <a href="/register" className="button button-outline">Register Here</a>
                        <a href="/charity" className="button button-shop">Shop</a>
                    </div>
                </div>

                <div className="Welcome-Right-Box">
                    <Image src="/home-clothes-donation.png" alt="Image of clothes being donated" width={560} height={360} className="Welcome-Image" priority/>
                </div>
            </section>

            {/* how it works */}
            <section className="Home-Info-Section">
                <h2>How It Works</h2>
                <div className="Home-Info-Boxes">
                    <div className="Home-Info-Card">
                        <h3>1. Add your items</h3>
                        <p>Fill out the information of your clothing and what type of clothing it is.</p>
                    </div>

                    <div className="Home-Info-Card">
                        <h3>2. Upload a photo of the Clothing</h3>
                        <p>Upload a clear photo of the clothing in order for us to process it faster.</p>
                    </div>

                    <div className="Home-Info-Card">
                        <h3>3. We review it and respond back</h3>
                        <p>If accepted, we review it and send you drop-off details.</p>
                    </div>
                </div>
            </section>

            {/* about us area */}
            <section className="About-Us-Section">
                <h2>About Us</h2>
                <p>
                    SustainWear is an organisation that helps donors give away their clothes 
                    to people who need them the most. We work with local charities to review 
                    the item and distribute it to people in need.
                </p>
                <p><strong>Our organisations helps to reduce landfill waste and environmental impact by distributing your donated item!</strong></p>
            </section>


<div className="Partners-Button-Container">
  <Link href="/partners" className="button Partners-Button">
    List of Charities
  </Link>
</div>




            {/* Footer */}
            <footer className="Home-Footer">
                <p>2025 SustainWear Charity!</p>
                <p><strong>All Rights Reserved.</strong></p>
            </footer>
        </main>
    );
}
