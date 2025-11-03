import os, zipfile

def createSSHClient(server, port, user, password):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(server, port, user, password)
    return client

ssh = createSSHClient("www.felizdate.no", 22, "felizdate", "Corrigate9")

# zip application
for fname in os.listdir('.'):
    basename, ext = os.path.splitext(fname)
    if ext.lower().endswith('zip'): continue
    f = zipfile.ZipFile('%s.zip' % basename, 'w')
    f.write(fname)
    f.close()
    print fname

# transfer it via scp
with closing(Write(ssh.get_transport(), '/home/felizdate')) as scp:
    scp.send_file('felizdate.zip', True)

# deploy application
ssh.execute('./setup_felizdate')

