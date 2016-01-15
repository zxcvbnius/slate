# Errors

Diuit uses conventional HTTP response codes to indicate the success or failure of an API request. In the following we list a table of error codes we’ll return on our platform:


Error Code | Meaning
---------- | -------
499 | UNKOWN_ERROR -- unknow error
498 | NOTCONNECTED -- Your connection is broken
497 | INVALID_PARAMS -- Your request sucks
496 | OUT_OF_MAX_UPLOAD_FILESIZE -- The data of message size must <= 5MB
495 | FILE_NOT_FOUND -- You tried to access a file which doesn't exit

