#!/usr/bin/expect -f

set timeout -1
set fingerprint [lindex $argv 0];
set command_prefix [lindex $argv 1];

spawn $command_prefix/gpg --edit-key $fingerprint
expect  "gpg> "

# subkey 1
send "key 1 \r"
expect  "gpg> "

send "keytocard \r"
expect "Your selection? "
send "2 \r"
expect { 
    "Replace existing key? (y/N) " {
        send "y \r"
        exp_continue
    }
    "gpg>" {
        send "key 1 \r"
    }
}

expect  "gpg> "


# subkey 2
send "key 2 \r"
expect  "gpg> "

send "keytocard \r"
expect "Your selection? "
send "1 \r"
expect { 
    "Replace existing key? (y/N) " {
        send "y \r"
        exp_continue
    }
    "gpg>" {
        send "key 2 \r"
    }
}

expect "gpg> "


# subkey 3
send "key 3 \r"
expect "gpg> "

send "keytocard \r"
expect "Your selection? "
send "3 \r"
expect { 
    "Replace existing key? (y/N) " {
        send "y \r"
        exp_continue
    }
    "gpg>" {
        send "key 3 \r"
    }
}

expect "gpg> "

# save
send "save \r"
expect eof

