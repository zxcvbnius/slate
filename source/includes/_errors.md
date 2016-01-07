# Errors

<aside class="notice">This error section is stored in a separate file in `includes/_errors.md`. Slate allows you to optionally separate out your docs into many files...just save them to the `includes` folder and add them to the top of your `index.md`'s frontmatter. Files are included in the order listed.</aside>

The Kittn API uses the following error codes:


Error Code | Meaning
---------- | -------
499 | UNKOWN_ERROR -- unknow error
498 | NOTCONNECTED -- Your connection is broken
497 | INVALID_PARAMS -- Your request sucks
496 | OUT_OF_MAX_UPLOAD_FILESIZE -- The data of message size must <= 5MB
495 | FILE_NOT_FOUND -- You tried to access a file which doesn't exit

