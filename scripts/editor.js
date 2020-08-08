const editor = {
    file: document.getElementById('file'),
    apply: function (code, insert = false) {
        let text = window.editor.getSelectedText()
        if (insert) {
            window.editor.insert(`<${code} />`);
        } else if (code == 'img') {
            const image = prompt("Insert your image link");
            const newText = `<img src="${image}" />`
            window.editor.session.replace(window.editor.getSelectionRange(), newText)
        } else if (code == 'a') {
            const link = prompt("Insert your link");
            if (!text) {
                text = prompt("Insert your link name")
            }
            const newText = `<a href="${link}">${text}</a>`
            window.editor.session.replace(window.editor.getSelectionRange(), newText)
        } else if (code == 'heading') {
            const num = prompt('Insert number between 1 (biggest heading) to 6 (smallest heading)')
            if (Number(num) && Number(num) >= 1 && Number(num) <= 6) {
                const newText = `<h${num}>${text}</h${num}>`
                window.editor.session.replace(window.editor.getSelectionRange(), newText)
            } else alert('Invalid value!')
        }
        else {
            const newText = `<${code}>${text}</${code}>`
            window.editor.session.replace(window.editor.getSelectionRange(), newText);
        }
        window.editor.focus()
    },
    new: function () {
        let id = 'html-' + parser.uuid()
        parser.output.innerHTML = ''
        localStorage.setItem(id, '')
        history.pushState('', "HTML Editor and Instant Preview", "?id=" + id)
        window.editor.setValue('<b>Hey!</b>')
        modal.close()
    },
    open: function (key) {
        history.pushState('', "HTML Editor and Instant Preview", "?id=" + key)
        parser.render(true)
        modal.close()
    },
    saveFile: function () {
        const type = "text/plain;charset=utf-8"
        const url = new URLSearchParams(window.location.search)
        const id = url.get('id') + '.html'
        const t = window.editor.getValue()
        try {
            var b = new Blob([t], {
                type: type
            });
            saveAs(b, id);
        } catch (e) {
            window.open("data:" + id + "," + encodeURIComponent(t), '_blank', '');
        }
    },
    delete: function (key, i) {
        const url = new URLSearchParams(window.location.search)
        const drafts = Object.keys(localStorage).filter(draft => draft.startsWith('html-'))

        if (confirm('Are you sure you want to delete this draft?')) {
            localStorage.removeItem(key)

            if (drafts.length === 1) {
                editor.new()
            } else if (url.get('id') === key) {
                const temp = drafts.filter(d => d != key)[0]
                window.editor.getValue(localStorage.getItem(temp))
                history.pushState('', "HTML Editor and Instant Preview", "?id=" + temp)
            }
            parser.render({})
        }
    },
    openTab: function (which) {
        document.querySelectorAll('#switch-mode button').forEach(el => {
            if (el.id === which) el.classList.add('tabOpen')
            else el.classList.remove('tabOpen')
        });
        if (which === 'editor-switch') {
            document.getElementById('left').style.display = 'block'
            document.getElementById('right').style.display = 'none'
        }
        if (which === 'preview-switch') {
            document.getElementById('left').style.display = 'none'
            document.getElementById('right').style.display = 'block'
        }
    },
    setDrafts: function (typing = false) {
        if (typing) document.getElementById('drafts-list').innerHTML = ''
        const drafts = Object.keys(localStorage).filter(draft => draft.startsWith('html-'))
        drafts.forEach((draft, i) => {
            const selector = document.getElementById('drafts-list')
            const curr = selector.innerHTML
            const data = {
                key: draft,
                content: localStorage.getItem(draft).substring(0, 100) + '...'
            }
            const html = `<div class="draft"><div>${data.content}</div><div class="flex"><button onclick="editor.open('${data.key}')">Open</button> <button class="delete" onclick="editor.delete('${data.key}')"><i class="fas fa-trash"></i> Delete</button></div></div>`
            selector.innerHTML = curr + html
        })
    },
    init: function () {
        document.onkeyup = editor.shortcuts
        editor.setDrafts()
        editor.file.addEventListener("change", function () {
            if (this.files && this.files[0]) {
                var myFile = this.files[0];
                if (myFile.size < 100000) {
                    const filename = myFile.name.split('.')
                    if (['html'].includes(filename[filename.length - 1])) {
                        var reader = new FileReader();
                        let fname = filename[0]
                        if (!fname.startsWith('html')) {
                            fname = 'html-' + fname
                        }
                        reader.addEventListener('load', function (e) {
                            window.editor.setValue(e.target.result)
                            history.pushState('', "HTML Editor and Instant Preview", "?id=" + fname)
                            parser.render()
                            modal.close()
                        });
                        reader.readAsBinaryString(myFile)
                    } else {
                        alert("File must be html")
                    }
                } else {
                    alert("File is too big :(")
                }
            }
        });

    }
}