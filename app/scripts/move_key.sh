#!/usr/bin/expect -f

set timeout -1
set fingerprint [lindex $argv 0];

spawn gpg --edit-key $fingerprint
expect  "gpg> "

# subkey 1
send "key 1 \r"
expect  "gpg> "

send "keytocard \r"
expect { 
    "Your selection? " { 
        send "2 \r"
        exp_continue
    }
    "Replace existing key? (y/N) " {
        send "y \r"
    }
}

expect  "gpg>"
send "key 1 \r"
expect  "gpg> "


# subkey 2
send "key 2 \r"
expect  "gpg> "

send "keytocard \r"
expect { 
    "Your selection? " { 
        send "1 \r"
        exp_continue
    }
    "Replace existing key? (y/N) " {
        send "y \r"
    }
}

expect "gpg>"
send "key 2 \r"
expect "gpg> "


# subkey 3
send "key 3 \r"
expect "gpg> "

send "keytocard \r"
expect { 
    "Your selection? " { 
        send "3 \r"
        exp_continue
    }
    "Replace existing key? (y/N) " {
        send "y \r"
    }
}
expect "gpg> "

send "key 3 \r"
expect "gpg> "

# save
send "save \r"
expect eof

