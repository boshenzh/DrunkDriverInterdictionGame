
#!/usr/bin/python
import sys
import cgi, cgitb 

cgitb.enable()

print('Hello from python')
print('First param:'+sys.argv[1]+'#')
print('Second param:'+sys.argv[2]+'#')