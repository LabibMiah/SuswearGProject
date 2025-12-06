import Link from "next/link";
import "./partners.css";

import "../homepage.css"; 

export default function PartnersPage() {
  return (
    <main>
      <div className="Main-ContainerBox">
        <section className="Partners-Header">
          <h1>Our Charity Partners</h1>
          <p>
            SustainWear works with other local charities to collect, sort and
            distribute clothes to people in need.
          </p>
        </section>
<section className="Partners-Grid">
<div className="Partner-Row">
<div className="Partner-Number">1</div>
<article className="Partner-Card">
      <h2 className="Partner-Title">Help Save Clothes</h2>
      <p>
        This charity helps low income families to help prove them clothing and accessories. 
      </p>
    </article>
  </div>

  <div className="Partner-Row">
    <div className="Partner-Number">2</div>
    <article className="Partner-Card">
      <h2 className="Partner-Title">Green Clothes</h2>
    <p>
        Helps people that are experiencing homelessness, by providing warm
        and appropriate clothing and footwear in the cold seasons.
      </p>
    </article>
  </div>
  <div className="Partner-Row">
    <div className="Partner-Number">3</div>
    <article className="Partner-Card">
      <h2 className="Partner-Title">Wear Smart</h2>
      <p>
        Helps people that want to have smart, work and interview clothes so they
        can feel better and confident during education or job interviews.
      </p>
    </article>
  </div>
</section>
<div className="Partners-Back-Home">
<Link href="/" className="button button-outline">
            Back to Home
        </Link>
        </div>
      </div>
    </main>
  );
}
