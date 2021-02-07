
let activePost, comments;

// gets post from the server:
const getPost = () => {
    // get post id from url address:
    const url = window.location.href;
    id = url.substring(url.lastIndexOf('#') + 1);

    // fetch post:
    fetch('/api/posts/' + id + '/')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            activePost = data;
            renderPost();
        });
};

const getComments = () => {
  const url = window.location.href;
  post_id = url.substring(url.lastIndexOf('#') + 1);

  // fetch comments:
  fetch('/api/comments?post_id=' + post_id)
      .then(response => response.json())
      .then(data => {
          console.log(data);
          comments = data;
          renderComments();
      });
}

const addComment = () => {
  const url = window.location.href;
  post_id = url.substring(url.lastIndexOf('#') + 1);

  const data =  {
    author: document.querySelector('#comment-author').value,
    post: post_id,
    comment: document.querySelector('#comment-body').value
  };

  fetch('/api/comments/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }).then(response => {
    getComments();
  });
}

const deleteComment = (comment_id) => {
  if (confirm("Are you sure you want to delete this comment?")) {
    fetch('/api/comments/' + comment_id + '/', {
      method: 'DELETE'
    }).then(response => {
      getComments();
    })
  }
}

// updates the post:
const updatePost = (ev) => {
    const data = {
        title: document.querySelector('#title').value,
        content: document.querySelector('#content').value,
        author: document.querySelector('#author').value
    };
    console.log(data);
    fetch('/api/posts/' + activePost.id + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            activePost = data;
            renderPost();
            showConfirmation();
        });

    // this line overrides the default form functionality:
    ev.preventDefault();
};

const deletePost = (ev) => {
    const doIt = confirm('Are you sure you want to delete this blog post?');
    if (!doIt) {
        return;
    }
    fetch('/api/posts/' + activePost.id + '/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // navigate back to main page:
        window.location.href = '/';
    });
    ev.preventDefault()
};

// creates the HTML to display the post:
const renderPost = (ev) => {
    const paragraphs = '<p>' + activePost.content.split('\n').join('</p><p>') + '</p>';
    const template = `
        <p id="confirmation" class="hide"></p>
        <h1>${activePost.title}</h1>
        <div class="date">${formatDate(activePost.published)}</div>
        <div class="content">${paragraphs}</div>
        <p>
            <strong>Author: </strong>${activePost.author}
        </p>
    `;
    document.querySelector('.post').innerHTML = template;
    toggleVisibility('view');

    // prevent built-in form submission:
    if (ev) { ev.preventDefault(); }
};

const renderComments = (ev) => {
    const paragraphs = '<p>' + activePost.content.split('\n').join('</p><p>') + '</p>';
    const template = `
        <p>
            <strong>Comment by: </strong>${activePost.author}
        </p>
        <div class="content">${paragraphs}</div>
    `;
    comment_elementes = comments.map((comment) => {
      const paragraphs = '<p>' + comment.comment.split('\n').join('</p><p>') + '</p>';
      const template = `
          <div>
              <strong>Comment by: </strong>${comment.author}
              <i class="btn fas fa-trash-alt" style="float: right;" onClick="deleteComment('${comment.id}');"></i>
          </div>
          <div class="content">${paragraphs}</div>
          <hr>
      `;
      return template
    });
    document.querySelector('.comments').innerHTML = comment_elementes.join('\n');
    // toggleVisibility('view');
}

// creates the HTML to display the editable form:
const renderForm = () => {
    const htmlSnippet = `
        <div class="input-section">
            <label for="title">Title</label>
            <input type="text" name="title" id="title" value="${activePost.title}">
        </div>
        <div class="input-section">
            <label for="author">Author</label>
            <input type="text" name="author" id="author" value="${activePost.author}">
        </div>
        <div class="input-section">
            <label for="content">Content</label>
            <textarea name="content" id="content">${activePost.content}</textarea>
        </div>
        <button class="btn btn-main" id="save" type="submit">Save</button>
        <button class="btn" id="cancel" type="submit">Cancel</button>
    `;

    // after you've updated the DOM, add the event handlers:
    document.querySelector('#post-form').innerHTML = htmlSnippet;
    document.querySelector('#save').onclick = updatePost;
    document.querySelector('#cancel').onclick = renderPost;
    toggleVisibility('edit');
};

const formatDate = (date) => {
    const options = {
        weekday: 'long', year: 'numeric',
        month: 'long', day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-US', options);
};

// handles what is visible and what is invisible on the page:
const toggleVisibility = (mode) => {
    if (mode === 'view') {
        document.querySelector('#view-post').classList.remove('hide');
        document.querySelector('#menu').classList.remove('hide');
        document.querySelector('#post-form').classList.add('hide');
    } else {
        document.querySelector('#view-post').classList.add('hide');
        document.querySelector('#menu').classList.add('hide');
        document.querySelector('#post-form').classList.remove('hide');
    }
};

const showConfirmation = () => {
    document.querySelector('#confirmation').classList.remove('hide');
    document.querySelector('#confirmation').innerHTML = 'Post successfully saved.';
};

// called when the page loads:
const initializePage = () => {
    // get the post from the server:
    getPost();
    getComments();
    // add button event handler (right-hand corner:
    document.querySelector('#edit-button').onclick = renderForm;
    document.querySelector('#delete-button').onclick = deletePost;
    document.querySelector('#comment-save-button').onclick = addComment;
};

initializePage();
