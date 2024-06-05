// Define the URL of the GitHub Gist
const gistUrl = 'https://gist.githubusercontent.com/Sanat-Jha/18725dc92e4cf0cda0c2901520960a48/raw/';

// Function to fetch the data and sanitize it
async function fetchAndSanitizeData() {
  try {
    const response = await fetch(gistUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const rawData = await response.text();

    // Remove non-printable control characters from the raw data
    const sanitizedData = rawData.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    const data = JSON.parse(sanitizedData);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Main function to execute after fetching data
async function main() {
  const productsData = await fetchAndSanitizeData();
  if (productsData) {
    const products = productsData.map(product => ({
      title: product.title,
      category: product.category,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl
    }));

    console.log('Products fetched successfully:', products);
    // Your code to work with the products list goes here

    // Get the container for the category buttons
    const categoryButtonContainer = document.querySelector('.category-buttons');

    // Create an object to store all the different categories
    const categories = {};

    // Loop through the products array and add all the categories to the object
    products.forEach(product => {
      const productCategories = product.category.split(',');
      productCategories.forEach(category => {
        const trimmedCategory = category.trim().toLowerCase();
        categories[trimmedCategory] = true;
      });
    });

    // Loop through the categories object and add buttons for each category to the HTML
    Object.keys(categories).forEach(category => {
      // Capitalize the first letter of each word in the category title
      const capitalizedCategory = category.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const button = document.createElement('button');
      button.classList.add('category-button');
      button.textContent = capitalizedCategory;
      button.setAttribute('onclick', `category('${category}')`);
      categoryButtonContainer.appendChild(button);
    });


    // Shuffle the products list
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function toggleDropdown() {
      const dropdown = document.querySelector('.designs-dropdown-content');
      dropdown.classList.toggle('show');


      // Close dropdown when clicking outside of it
      window.onclick = function (event) {
        if (!event.target.matches('.designs-dropdown-title')) {
          const dropdowns = document.getElementsByClassName('designs-dropdown-content');
          for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
              openDropdown.classList.remove('show');
            }
          }
        }
      }


    }


    shuffle(products);

    const gridContainer = document.querySelector('.grid-container');
    const paginationLinks = document.querySelector('.pagination-links');
    const previousPageBtn = document.querySelector('.previous-page-btn');
    const nextPageBtn = document.querySelector('.next-page-btn');
    const productsPerPage = 21;
    let currentPage = 1;

    // Function to render products for a given page
    function renderProducts(page) {
      // Clear the grid container
      gridContainer.innerHTML = '';

      // Calculate the start and end index for the current page
      const startIndex = (page - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;

      // Render the products for the current page
      for (let i = startIndex; i < endIndex && i < products.length; i++) {
        const product = products[i];
        const html = `
      <div class="design-card">
        <div class="card-image">
          <img src="${product.imageUrl}" alt="${product.title}">
        </div>
        <div class="card-info">
          <h3>${product.title}</h3>
          <div class="btn-container">
            <a href="${product.productUrl}" target="_blank"class="btn btn-black">Look Products</a>
          </div>
        </div>
      </div>
    `;
        gridContainer.insertAdjacentHTML('beforeend', html);
      }

      // Scroll to top if it's the first page, otherwise scroll to 700
      if (page === 1) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo(0, 700);
      }
    }


    // Function to render the pagination links
    function renderPagination() {
      // Calculate the total number of pages
      const totalPages = Math.ceil(products.length / productsPerPage);

      // Clear the pagination links
      paginationLinks.innerHTML = '';

      // Render a link for each page
      for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement('a');
        link.textContent = i;
        link.classList.add('pagination-link');
        if (i === currentPage) {
          link.classList.add('active');
        }
        link.addEventListener('click', (e) => {
          e.preventDefault();
          currentPage = i;
          renderProducts(currentPage);
          renderPagination();
        });
        paginationLinks.appendChild(link);
      }
    }

    // Function to go to the previous page
    function goToPreviousPage() {
      if (currentPage > 1) {
        currentPage--;
        renderProducts(currentPage);
        renderPagination();
      }
    }

    // Function to go to the next page
    function goToNextPage() {
      const totalPages = Math.ceil(products.length / productsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts(currentPage);
        renderPagination();
      }
    }

    // Add event listeners for the previous and next buttons
    previousPageBtn.addEventListener('click', goToPreviousPage);
    nextPageBtn.addEventListener('click', goToNextPage);

    // Render the initial page
    renderProducts(currentPage);
    renderPagination();





    function search(searchTerm) {
      const filteredProducts = products.filter((product) => {
        const titleWords = product.title.split(' ');
        const searchWords = searchTerm.split(' ');
        let matchCount = 0;

        // Count the number of words in the title that match any of the search words
        titleWords.forEach((titleWord) => {
          searchWords.forEach((searchWord) => {
            if (titleWord.toLowerCase().includes(searchWord.toLowerCase())) {
              matchCount++;
            }
          });
        });

        return matchCount > 0;
      });

      // Sort the filtered products by number of matching words
      filteredProducts.sort((a, b) => {
        const aTitleWords = a.title.split(' ');
        const bTitleWords = b.title.split(' ');
        const aMatchCount = aTitleWords.filter((titleWord) => searchTerm.toLowerCase().includes(titleWord.toLowerCase())).length;
        const bMatchCount = bTitleWords.filter((titleWord) => searchTerm.toLowerCase().includes(titleWord.toLowerCase())).length;

        return bMatchCount - aMatchCount;
      });

      // Display the filtered products in the grid
      gridContainer.innerHTML = '';
      filteredProducts.forEach((product) => {
        const html = `
      <div class="design-card">
        <div class="card-image">
          <img src="${product.imageUrl}" alt="${product.title}">
        </div>
        <div class="card-info">
          <h3>${product.title}</h3>
          <div class="btn-container">
            <a href="${product.productUrl}" target="_blank"class="btn btn-black">Look Products</a>
          </div>
        </div>
      </div>
    `;
        gridContainer.insertAdjacentHTML('beforeend', html);
      });
    }

    function category(categoryName) {
      const categories = categoryName.split(',');
      const filteredProducts = products.filter((product) => product.category && categories.some(category => product.category.toLowerCase().includes(category.toLowerCase().trim())));
      const gridContainer = document.querySelector('.grid-container');
      gridContainer.innerHTML = '';

      for (let i = 0; i < 21 && i < filteredProducts.length; i++) {
        const product = filteredProducts[i];
        const html = `
      <div class="design-card">
        <div class="card-image">
          <img src="${product.imageUrl}" alt="${product.title}">
        </div>
        <div class="card-info">
          <h3>${product.title}</h3>
          <div class="btn-container">
            <a href="${product.productUrl}" target="_blank" class="btn btn-black">Look Products</a>
          </div>
        </div>
      </div>
    `;
        gridContainer.insertAdjacentHTML('beforeend', html);
      }

      const paginationContainer = document.querySelector('.pagination');
      paginationContainer.innerHTML = '';

      for (let i = 1; i <= Math.ceil(filteredProducts.length / 21); i++) {
        const pageNumber = i;
        const html = `
      <button class="pagination-btn">${pageNumber}</button>
    `;
        paginationContainer.insertAdjacentHTML('beforeend', html);
      }

      const paginationBtns = document.querySelectorAll('.pagination-btn');
      paginationBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          const startIndex = index * 21;
          gridContainer.scrollTo(0, 0);
          gridContainer.innerHTML = '';
          for (let i = startIndex; i < startIndex + 21 && i < filteredProducts.length; i++) {
            const product = filteredProducts[i];
            const html = `
          <div class="design-card">
            <div class="card-image">
              <img src="${product.imageUrl}" alt="${product.title}">
            </div>
            <div class="card-info">
              <h3>${product.title}</h3>
              <div class="btn-container">
                <a href="${product.productUrl}" target="_blank" class="btn btn-black">Look Products</a>
              </div>
            </div>
          </div>
        `;
            gridContainer.insertAdjacentHTML('beforeend', html);
          }
        });
      });
    }


  } else {
    console.log('Failed to fetch products.');
  }
}

// Call the main function
main();
