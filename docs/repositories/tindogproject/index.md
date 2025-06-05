<h1>TinDog Project</h1>
<p><strong>Website is up: https://ba-calderonmorales.github.io/TinDogProject/ </strong></p>

<p>Webpage was created with the assistance of the Udemy:</p>
<p>https://www.udemy.com/course/the-complete-web-development-bootcamp/.</p>
<p>It was meant to assist me in better styling basic html5 and css files so that they are easier to read and easier to </p>
<p>manipulate in the way that I want to with bootstrap 5.<p>
<p>You can see how this website looks by looking at the GitHub link to this project site as soon as I finish with the </p>
<p>tutorial.</p>
<strong>2021-24-07</strong>
</br>
<p>A few notes from Udemy lectures</p>
<strong>DRY: Do Not Repeat Yourself</strong>
<h2>Code Refactoring</h2>
  1. Readability: How well can your code be read.
  2. Modularity: Is it scalable?
  3. Efficiency: How difficult is it to run your code on the server?
  4. Length: Making sure you adhere to DRY. Don't sacrifice readability for length/fun.
  ____
<p>Adding specific classes to html tags that are repetitive in nature (i.e. big-heading, section-heading) it's good practice to just name the class name while the html is being written.</p>
<h3>You can combine selectors:</h3>
<p>selector1, selector2 { ... }</p>
<p>h1, p { ... }</p>
<h3>Or you can use Heirarchical Selectors</h3>
<p>i.e.: #title .container-fluid { ... } </p>
<p>overrides: .container-fluid, without changing everywhere else container-fluid is used as a class.</p>
<img src="https://user-images.githubusercontent.com/62074841/126910246-7c5036a4-81b1-454a-b6af-17241b48685c.png" alt="example of heirarchical selecting">
<p>The heirarchy should be read from right to left. So, for example:</p>
<p>div <strong>.title</strong> { color: red; }</p>
<p>The .title is the Child and the div is the Parent.</p>
<h3>Combined Selectors</h3>
<p>Syntax: selector1.selector2 { ... } OR selector1#selector2 { ... }</p>
<p>Can be an html element combined with a class, or an html element combined with an id.</p>
<p>Have to all occur within the same element.</p>
<p>Read from left to right.</p>
<img src="https://user-images.githubusercontent.com/62074841/126910905-60becd28-f07b-445f-a755-f97b613402d7.png" alt="example of how to combine selectors">
<hr/>
<h3>The inline element style overrides the id, the id overrides the class, the class overrides the tag.</h3>
<p>It's best to use id's very, very sparingly. Always go towards using classes instead of ids (initially).</p>
<p>Does not matter if you're using bootstrap in your code. Try to avoid inline styling at all costs, too!</p>
<p>There are no cases where inline styling cannot be handled in an outside, external stylesheet.</p>
<p><strong>Complete</strong></p>
<p>7/27/2021</p>


_It's been a while since this repo was updated._
