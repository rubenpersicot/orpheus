"""Add docstring here."""
import sqlite3
from flask import Flask, render_template, request, url_for, flash, redirect, jsonify
from werkzeug.exceptions import abort


def get_db_connection():
    """Get database connection."""
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn


def get_post(post_id):
    """Return post with given id."""
    conn = get_db_connection()
    article = conn.execute('SELECT * FROM posts WHERE id = ?',
                           (post_id,)).fetchone()
    conn.close()
    if article is None:
        abort(404)
    return article


def change_letter(string, old_letter, new_letter):
    """Change all occurrences of a letter to another in a string."""
    new_string = ""
    for elem in string:
        if elem == old_letter:
            new_string += new_letter
        else:
            new_string += elem
    return new_string


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your secret key'


@app.route('/')
def index():
    """Show main page."""
    conn = get_db_connection()
    posts = conn.execute('SELECT * FROM posts').fetchall()
    conn.close()
    return render_template('index.html', posts=posts)


@app.route('/<int:post_id>')
def post(post_id):
    """Show post."""
    article = get_post(post_id)
    return render_template('post.html', post=article)


@app.route('/create', methods=('GET', 'POST'))
def create():
    """Create new post."""
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']

        if not title:
            flash('Title is required!')
        else:
            conn = get_db_connection()
            conn.execute('INSERT INTO posts (title, content) VALUES (?, ?)',
                         (title, content))
            conn.commit()
            conn.close()
            return redirect(url_for('index'))

    return render_template('create.html')


@app.route('/<int:identifier>/edit', methods=('GET', 'POST'))
def edit(identifier):
    """Change all 'e's to 'a's in a post."""
    article = get_post(identifier)
    content = article['content']
    title = article['title']

    content = change_letter(content, "e", "a")
    conn = get_db_connection()
    conn.execute('UPDATE posts SET title = ?, content = ?'
                 ' WHERE id = ?', (title, content, identifier))
    conn.commit()
    conn.close()
    return redirect(url_for('index'))
    # return jsonify(content)


@app.route('/<int:id>/delete', methods=('POST',))
def delete(identifier):
    """Delete post from database."""
    article = get_post(identifier)
    conn = get_db_connection()
    conn.execute('DELETE FROM posts WHERE id = ?', (identifier,))
    conn.commit()
    conn.close()
    flash('"{}" was successfully deleted!'.format(article['title']))
    return redirect(url_for('index'))


if __name__ == "__main__":
    app.run(debug=True)
